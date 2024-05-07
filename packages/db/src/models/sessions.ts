import { cache } from '@metronome/cache';
import { env } from '@metronome/env';
import crypto from 'crypto';
import { and, between, eq, sql } from 'drizzle-orm';
import { interval } from 'rxjs';
import { UAParser } from 'ua-parser-js';

import { db } from '../db';
import { nanoid } from '../modules/nanoid';
import {
  getBounceRateAggregatedView,
  getDevicesAggregatedView,
  getLocationsAggregatedView,
  getSessionOverviewAggregatedView,
  pageviews,
  sessions,
} from '../schema';
import { CachedSession, Identifier, Interval, PageviewEvent, Project, Range } from '../types';
import { toPostgresTzName } from '../utils/aggregations';
import { observable, operators, throttleTime } from '../utils/events';
import { resolveIp } from '../utils/ip';

const SESSION_DURATION_MINUTES = 30;
const VISITORS_RIGHT_NOW_DURATION_MINUTES = env.when({
  production: 5,
  development: 1,
});

function getUserIds(project: Project, identifier: Identifier): [id: string, previousId: string] {
  const { salt, previousSalt } = project;

  const projectSalt = project.id + salt;
  const projectPreviousSalt = project.id + previousSalt;
  const key = identifier.ip + identifier.ua;

  const sessionId = crypto
    .createHash('md5')
    .update(key + projectSalt)
    .digest('hex');

  const previousSessionId = crypto
    .createHash('md5')
    .update(key + projectPreviousSalt)
    .digest('hex');

  const id = Buffer.from(sessionId).toString('utf-8');
  const previousId = Buffer.from(previousSessionId).toString('utf-8');

  return [id, previousId];
}

async function sessionFromCache(ids: [string, string], timestamp: number) {
  const midnight = new Date();
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);

  const midnightTimestamp = midnight.getTime();

  const sessionExpiresIn = new Date();
  sessionExpiresIn.setMinutes(sessionExpiresIn.getMinutes() + SESSION_DURATION_MINUTES);

  const sessionExpiresInTimestamp = sessionExpiresIn.getTime();

  // Take midnight if the sessionExpires is greater than midnight
  const sessionReferenceTime =
    sessionExpiresInTimestamp > midnightTimestamp ? midnightTimestamp : sessionExpiresInTimestamp;

  // Now subtract the ms from the current date
  const sessionDurationSeconds = Math.round((sessionReferenceTime - Date.now()) / 1000);

  const [id, previousId] = ids;

  const session =
    (await cache.unique.get<CachedSession>(['session', id])) ||
    (await cache.unique.get<CachedSession>(['session', previousId]));

  if (session) {
    // Reset sesssion
    await cache.unique.set(['session', session.id], session, sessionDurationSeconds);
    return { session, existed: true };
  }

  const sessionId = nanoid(13);

  const newSession = await cache.unique.set(
    ['session', id],
    { id: sessionId, userId: id, timestamp },
    sessionDurationSeconds,
  );

  return { session: newSession, existed: false };
}

export async function upsert(
  project: Project,
  pageviewEvent: PageviewEvent,
): Promise<{ sessionId: string; userId: string }> {
  const {
    details: { timestamp, ip, ua, deviceCategory, screen, language, connection },
  } = pageviewEvent;

  // Get locks
  const ids = getUserIds(project, { ip, ua });

  const lock = await cache.lock(ids, 5000);

  const { browser, os, device } = UAParser(ua);

  const geo = await resolveIp(ip);

  const { session, existed } = await sessionFromCache(ids, timestamp);

  if (!existed) {
    await db({ write: true })
      .insert(sessions)
      .values({
        teamId: project.teamId,
        projectId: project.id,
        timestamp: new Date(timestamp),
        sessionId: session.id,
        userId: session.userId,
        duration: 0n,
        browser: browser.name ?? 'unknown',
        os: os.name ?? 'unknown',
        device: device.type ?? 'unknown',
        deviceCategory,
        screen: screen,
        language: language,
        connection: connection,
        pageviews: 1,
        ...geo,
      });
  } else {
    await db({ write: true })
      .update(sessions)
      .set({
        duration: BigInt(timestamp - session.timestamp),
        pageviews: sql<number>`${sessions.pageviews} + 1`,
      })
      .where(
        and(
          eq(sessions.teamId, project.teamId),
          eq(sessions.projectId, project.id),
          eq(sessions.sessionId, session.id),
          eq(sessions.userId, session.userId),
          eq(sessions.timestamp, new Date(session.timestamp)),
        ),
      );
  }

  await lock.release();

  return { sessionId: session.id, userId: session.userId };
}

export async function visitorsRightNow(project: Project): Promise<number> {
  console.time('sessions.visitorsRightNow');

  const [{ visitorsRightNow = 0 }] = await db()
    .select({
      visitorsRightNow: sql<number>`count(distinct ${pageviews.sessionId})::integer`,
    })
    .from(pageviews)
    .innerJoin(
      sessions,
      and(
        // prettier-ignore
        sql`${sessions.timestamp} >= now() - '${sql.raw(SESSION_DURATION_MINUTES.toString())} minutes'::interval`,
        eq(sessions.sessionId, pageviews.sessionId),
        eq(sessions.teamId, project.teamId),
        eq(sessions.projectId, project.id),
      ),
    )
    .where(
      and(
        // prettier-ignore
        sql`${pageviews.timestamp} >= now() - '${sql.raw(VISITORS_RIGHT_NOW_DURATION_MINUTES.toString())} minutes'::interval`,
        eq(pageviews.teamId, project.teamId),
        eq(pageviews.projectId, project.id),
      ),
    );

  console.timeEnd('sessions.visitorsRightNow');
  return visitorsRightNow;
}

export async function overview({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}): Promise<{
  totalSessions: number;
  uniqueVisitors: number;
  duration: { p50: null | number };
}> {
  console.time('sessions.overview');

  const sessions = await getSessionOverviewAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const [
    { totalSessions, uniqueVisitors, durationP50 } = {
      totalSessions: 0,
      uniqueVisitors: 0,
      durationP50: null,
    },
  ] = await db()
    .select({
      totalSessions: sql<number>`sum(${sessions.count})::integer`,
      uniqueVisitors: sql<number>`sum(${sessions.uniqueUserIds})::integer`,
      durationP50: sql<number>`approx_percentile(0.5, rollup(${sessions.durationPctAgg}))`,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.teamId, project.teamId),
        eq(sessions.projectId, project.id),
        between(sessions.timestamp, fromDate, toDate),
      ),
    );

  console.timeEnd('sessions.overview');
  return { totalSessions, uniqueVisitors, duration: { p50: durationP50 } };
}

export async function overviewSeries({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}): Promise<{
  series: {
    timestamp: number;
    count: number;
    pageviews: number;
    uniqueUserIds: number;
    duration: number;
  }[];
}> {
  console.time('sessions.overviewSeries');

  const sessions = await getSessionOverviewAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const pgTz = await toPostgresTzName({ timeZoneId: from.timeZoneId });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const result = await db()
    .select({
      // prettier-ignore
      timestamp: sql<string>`time_bucket_gapfill('1 ${sql.raw(interval)}', ${sessions.timestamp}, ${sql.raw(pgTz)})`,
      count: sql<number>`sum(${sessions.count})::integer`,
      pageviews: sql<number>`sum(${sessions.pageviews})::integer`,
      uniqueUserIds: sql<number>`sum(${sessions.uniqueUserIds})::integer`,
      duration: sql<number>`approx_percentile(0.5, rollup(${sessions.durationPctAgg}))`,
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.teamId, project.teamId),
        eq(sessions.projectId, project.id),
        between(sessions.timestamp, fromDate, toDate),
      ),
    )
    .groupBy(sql`1`);

  const series = result.map(({ timestamp, count, pageviews, uniqueUserIds, duration }) => {
    const tsParsed = timestamp.replace(' ', 'T').replace('+00', '') + 'Z';
    return {
      timestamp: new Date(tsParsed).valueOf(),
      count,
      pageviews,
      uniqueUserIds,
      duration,
    };
  });

  console.timeEnd('sessions.overviewSeries');
  return { series };
}

export async function bounceRate({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}): Promise<number | null> {
  console.time('sessions.bounceRate');

  const bounceRates = await getBounceRateAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const [
    { singlePageSessions, totalSessions } = {
      singlePageSessions: 0,
      totalSessions: 0,
    },
  ] = await db()
    .select({
      singlePageSessions: sql<number>`sum(${bounceRates.singlePageSessions})::integer`,
      totalSessions: sql<number>`sum(${bounceRates.totalSessions})::integer`,
    })
    .from(bounceRates)
    .where(
      and(
        eq(bounceRates.teamId, project.teamId),
        eq(bounceRates.projectId, project.id),
        between(bounceRates.timestamp, fromDate, toDate),
      ),
    );

  console.timeEnd('sessions.bounceRate');

  return totalSessions === 0 || totalSessions === null
    ? null
    : (singlePageSessions / totalSessions) * 100;
}

export async function bounceRateSeries({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}): Promise<{
  series: {
    timestamp: number;
    bounceRate: number | null;
  }[];
}> {
  console.time('sessions.bounceRateSeries');

  const bounceRates = await getBounceRateAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const pgTz = await toPostgresTzName({ timeZoneId: from.timeZoneId });

  const result = await db()
    .select({
      // prettier-ignore
      timestamp: sql<string>`time_bucket_gapfill('1 ${sql.raw(interval)}', ${bounceRates.timestamp}, ${sql.raw(pgTz)})`,
      singlePageSessions: sql<number>`sum(${bounceRates.singlePageSessions})::integer`,
      totalSessions: sql<number>`sum(${bounceRates.totalSessions})::integer`,
    })
    .from(bounceRates)
    .where(
      and(
        eq(bounceRates.teamId, project.teamId),
        eq(bounceRates.projectId, project.id),
        between(bounceRates.timestamp, fromDate, toDate),
      ),
    )
    .groupBy(sql`1`);

  const series = result.map(({ timestamp, singlePageSessions, totalSessions }) => {
    const tsParsed = timestamp.replace(' ', 'T').replace('+00', '') + 'Z';
    return {
      timestamp: new Date(tsParsed).valueOf(),
      bounceRate:
        totalSessions === 0 || totalSessions === null
          ? null
          : (singlePageSessions / totalSessions) * 100,
    };
  });

  console.timeEnd('sessions.bounceRateSeries');

  return { series };
}

export async function countries({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}): Promise<
  {
    countryCode: string;
    country: string;
    count: number;
  }[]
> {
  console.time('sessions.countries');

  const locations = await getLocationsAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const result = await db()
    .select({
      countryCode: locations.countryCode,
      country: locations.country,
      count: sql<number>`sum(${locations.uniqueUserIds})::integer`,
    })
    .from(locations)
    .where(
      and(
        eq(locations.teamId, project.teamId),
        eq(locations.projectId, project.id),
        between(locations.timestamp, fromDate, toDate),
      ),
    )
    .groupBy(locations.countryCode, locations.country)
    .orderBy(sql`3 desc`);

  console.timeEnd('sessions.countries');

  return result;
}

export async function cities({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}): Promise<
  {
    countryCode: string;
    city: string;
    count: number;
  }[]
> {
  console.time('sessions.cities');

  const locations = await getLocationsAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const result = await db()
    .select({
      countryCode: locations.countryCode,
      city: locations.city,
      count: sql<number>`sum(${locations.uniqueUserIds})::integer`,
    })
    .from(locations)
    .where(
      and(
        eq(locations.teamId, project.teamId),
        eq(locations.projectId, project.id),
        between(locations.timestamp, fromDate, toDate),
      ),
    )
    .groupBy(locations.countryCode, locations.city)
    .orderBy(sql`3 desc`)
    .limit(400);

  console.timeEnd('sessions.cities');

  return result;
}

export function watch(
  project: Project,
  callback: (event: { ts: number }) => Promise<void>,
): () => void {
  callback({ ts: Date.now() });

  const subscription = observable
    .pipe(
      operators.project(project),
      operators.events(['pageview']),
      throttleTime(1000, undefined, { leading: true, trailing: true }),
    )
    .subscribe((data) => {
      const [e] = data;

      callback({
        ts: e.returnvalue.ts,
      });
    });

  const intervalSubscription = interval(1000 * 60 * 1).subscribe(() => {
    callback({ ts: Date.now() });
  });

  return () => {
    subscription.unsubscribe();
    intervalSubscription.unsubscribe();
  };
}

export async function devicesByBrowser({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}) {
  console.time('sessions.devicesByBrowser');

  const devices = await getDevicesAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const result = await db()
    .select({
      id: sql<string>`replace(lower(${devices.browser}), ' ', '')`,
      browser: devices.browser,
      uniqueUserIds: sql<number>`sum(${devices.uniqueUserIds})::integer`,
    })
    .from(devices)
    .where(
      and(
        eq(devices.teamId, project.teamId),
        eq(devices.projectId, project.id),
        between(devices.timestamp, fromDate, toDate),
      ),
    )
    .groupBy(devices.browser)
    .orderBy(sql`3 desc`);

  console.timeEnd('sessions.devicesByBrowser');
  return result;
}

export async function devicesByOs({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}) {
  console.time('sessions.devicesByOs');

  const devices = await getDevicesAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const result = await db()
    .select({
      id: sql<string>`replace(lower(${devices.os}), ' ', '')`,
      os: devices.os,
      uniqueUserIds: sql<number>`sum(${devices.uniqueUserIds})::integer`,
    })
    .from(devices)
    .where(
      and(
        eq(devices.teamId, project.teamId),
        eq(devices.projectId, project.id),
        between(devices.timestamp, fromDate, toDate),
      ),
    )
    .groupBy(devices.os)
    .orderBy(sql`2 desc`);

  console.timeEnd('sessions.devicesByOs');

  return result;
}
