import { and, between, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  getPageviewsOverviewAggregatedView,
  getPageviewsReferrersAggregatedView,
  getPageviewsRoutesAggregatedView,
  pageviews,
} from '../schema';
import { PageviewEventSchema } from '../schemaValidation';
import { Interval, PageviewEvent, Project, Range } from '../types';
import { observable, operators, throttleTime } from '../utils/events';
import { resolveIp } from '../utils/ip';
import { resolveReferrer } from '../utils/referrer';
import { getDisplayNameFromURL } from '../utils/url';
import { upsert as upsertSession } from './sessions';

export function isPageviewEvent(event: unknown): event is PageviewEvent {
  const result = PageviewEventSchema.safeParse(event);
  return result.success;
}

export function convertMetricToPageviewEvent(metric: any): PageviewEvent {
  const name = 'pageview';

  const details = {
    timestamp: metric.timestamp,
    pathname: metric.attributes?.['http.pathname'],
    query: new URL(metric.attributes?.['url.full'] ?? 'http://localhost').search,
    screen: metric.attributes?.['client.screen'],
    referrer: metric.attributes?.['client.referrer'],
    hostname: metric.attributes?.['app.hostname'],
    language: metric.attributes?.['client.language'],
    connection: metric.attributes?.['client.connection'],
    deviceCategory: metric.attributes?.['client.device_category'],
    hash: metric.attributes?.['app.version'],
    routeId: metric.attributes?.['remix.route_id'],
    routePath: metric.attributes?.['remix.route_path'],
    ip: metric.attributes?.['client.address'],
    ua: metric.attributes?.['user_agent.original'],
  };

  const pageviewEvent = { name, details };

  if (!isPageviewEvent(pageviewEvent)) {
    throw new Error('Invalid pageview event');
  }

  return pageviewEvent;
}

export async function insert(project: Project, pageviewEvent: PageviewEvent) {
  const { sessionId, userId } = await upsertSession(project, pageviewEvent);

  const {
    details: { timestamp, routeId, routePath = '', hash, pathname, query, ip },
  } = pageviewEvent;

  const { referrer, referrerDomain } = resolveReferrer(pageviewEvent.details.referrer);

  const geo = await resolveIp(ip);

  await db({ write: true })
    .insert(pageviews)
    .values({
      teamId: project.teamId,
      projectId: project.id,
      sessionId,
      userId,
      timestamp: new Date(timestamp),
      routeId,
      routePath,
      hash,
      urlPath: pathname,
      urlQuery: query,
      referrer: referrer,
      referrerDomain: referrerDomain,
      ...geo,
    });
}

export async function overview({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}) {
  console.time('pageviews.overview');

  const pageviews = await getPageviewsOverviewAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const [{ pageviewCount } = { pageviewCount: 0 }] = await db()
    .select({
      pageviewCount: sql<number>`sum(${pageviews.count})::integer`,
    })
    .from(pageviews)
    .where(
      and(
        eq(pageviews.teamId, project.teamId),
        eq(pageviews.projectId, project.id),
        between(pageviews.timestamp, fromDate, toDate),
      ),
    );

  console.timeEnd('pageviews.overview');

  return { pageviewCount };
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

  return () => subscription.unsubscribe();
}

export async function routesByRoutePath({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}): Promise<
  {
    routePath: string;
    uniqueUserIds: number;
  }[]
> {
  console.time('pageviews.routesByRoutePath');

  const pageviews = await getPageviewsRoutesAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const results = await db()
    .select({
      routePath: pageviews.routePath,
      uniqueUserIds: sql<number>`sum(${pageviews.uniqueUserIds})::integer`,
    })
    .from(pageviews)
    .where(
      and(
        eq(pageviews.teamId, project.teamId),
        eq(pageviews.projectId, project.id),
        between(pageviews.timestamp, fromDate, toDate),
      ),
    )
    .groupBy(pageviews.routePath)
    .orderBy(sql`2 desc`)
    .limit(400);

  console.timeEnd('pageviews.routesByRoutePath');

  return results;
}

export async function routesByUrlPath({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}): Promise<
  {
    routePath: string;
    urlPath: string;
    uniqueUserIds: number;
  }[]
> {
  console.time('pageviews.routesByUrlPath');

  const pageviews = await getPageviewsRoutesAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const results = await db()
    .select({
      routePath: pageviews.routePath,
      urlPath: pageviews.urlPath,
      uniqueUserIds: sql<number>`sum(${pageviews.uniqueUserIds})::integer`,
    })
    .from(pageviews)
    .where(
      and(
        eq(pageviews.teamId, project.teamId),
        eq(pageviews.projectId, project.id),
        between(pageviews.timestamp, fromDate, toDate),
      ),
    )
    .groupBy(pageviews.routePath, pageviews.urlPath)
    .orderBy(sql`3 desc`)
    .limit(400);

  console.timeEnd('pageviews.routesByUrlPath');

  return results;
}

export async function referrers({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}): Promise<
  {
    name: string | null;
    referrerDomain: string;
    uniqueUserIds: number;
  }[]
> {
  console.time('pageviews.referrers');

  const pageviews = await getPageviewsReferrersAggregatedView({
    timeZoneId: from.timeZoneId,
    interval,
  });

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const results = await db()
    .select({
      referrerDomain: pageviews.referrerDomain,
      uniqueUserIds: sql<number>`sum(${pageviews.uniqueUserIds})::integer`,
    })
    .from(pageviews)
    .where(
      and(
        eq(pageviews.teamId, project.teamId),
        eq(pageviews.projectId, project.id),
        between(pageviews.timestamp, fromDate, toDate),
      ),
    )
    .groupBy(pageviews.referrerDomain)
    .orderBy(sql`2 desc`)
    .limit(400);

  const referrersArray = results.map((r) => ({
    referrerDomain: r.referrerDomain,
    name: getDisplayNameFromURL(r.referrerDomain),
    uniqueUserIds: r.uniqueUserIds,
  }));

  console.timeEnd('pageviews.referrers');

  return referrersArray;
}
