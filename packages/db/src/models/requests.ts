import { and, between, eq, sql } from 'drizzle-orm';

import { db } from '../db';
import { getRequestsOverviewAggregatedView, requests } from '../schema';
import { RequestEventSchema } from '../schemaValidation';
import { Interval, Project, Range, RequestEvent } from '../types';
import { toPostgresTzName } from '../utils/aggregations';
import { observable, operators, throttleTime } from '../utils/events';
import { resolveIp } from '../utils/ip';

export function isRequestEvent(event: unknown): event is RequestEvent {
  const result = RequestEventSchema.safeParse(event);

  return result.success;
}

export async function insert(project: Project, requestEvent: RequestEvent) {
  const {
    details: { timestamp, duration, method, statusCode, pathname, type, ip },
  } = requestEvent;

  const geo = await resolveIp(ip);

  await db({ write: true })
    .insert(requests)
    .values({
      teamId: project.teamId,
      projectId: project.id,
      timestamp: new Date(timestamp),
      duration: BigInt(duration),
      method,
      statusCode,
      pathname,
      requestType: type,
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
  console.time('requests.overview');
  const requests = await getRequestsOverviewAggregatedView(from.timeZoneId, interval);

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const result = await db()
    .select({
      count: sql<number>`sum(${requests.count})::integer`,
      dataCount: sql<number>`sum(${requests.dataCount})::integer`,
      documentCount: sql<number>`sum(${requests.documentCount})::integer`,
      durationP50: sql<number>`approx_percentile(0.5, rollup(${requests.durationPctAgg}))`,
    })
    .from(requests)
    .where(
      and(
        between(requests.timestamp, fromDate, toDate),
        eq(requests.teamId, project.teamId),
        eq(requests.projectId, project.id),
      ),
    );

  console.timeEnd('requests.overview');

  if (result.length === 0) {
    return {
      count: null,
      duration: { p50: null },
      dataCount: null,
      documentCount: null,
    };
  }

  const [{ count, durationP50, dataCount, documentCount }] = result;

  return {
    count: count,
    duration: { p50: durationP50 },
    dataCount: dataCount,
    documentCount: documentCount,
  };
}

export async function countSeries({
  project,
  range: { from, to },
  interval = 'hour',
}: {
  project: Project;
  range: Range;
  interval: Interval;
}) {
  console.time('requests.countSeries');
  const requests = await getRequestsOverviewAggregatedView(from.timeZoneId, interval);

  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const pgTz = await toPostgresTzName({ timeZoneId: from.timeZoneId });

  const result = await db()
    .select({
      // prettier-ignore
      timestamp: sql<string>`time_bucket_gapfill('1 ${sql.raw(interval)}', ${requests.timestamp}, ${sql.raw(pgTz)})`,
      documentCount: sql<number | null>`sum(${requests.documentCount})::integer`,
      dataCount: sql<number | null>`sum(${requests.dataCount})::integer`,
    })
    .from(requests)
    .where(
      and(
        between(requests.timestamp, fromDate, toDate),
        eq(requests.teamId, project.teamId),
        eq(requests.projectId, project.id),
      ),
    )
    .groupBy(sql.raw('1'));

  const series = result.map(({ timestamp, dataCount, documentCount }) => {
    const tsParsed = timestamp.replace(' ', 'T').replace('+00', '') + 'Z';
    return {
      timestamp: new Date(tsParsed).valueOf(),
      dataCount,
      documentCount,
    };
  });

  console.timeEnd('requests.countSeries');
  return { series };
}

export async function watch(
  project: Project,
  callback: (event: { ts: number }) => Promise<void>,
): Promise<() => void> {
  await callback({ ts: Date.now() });

  const subscription = observable
    .pipe(
      operators.project(project),
      operators.events(['request']),
      throttleTime(1000, undefined, { leading: true, trailing: true }),
    )
    .subscribe(async ([e]) => {
      await callback({ ts: e.returnvalue.ts });
    });

  return () => subscription.unsubscribe();
}
