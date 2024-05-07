import { type Temporal } from '@js-temporal/polyfill';
import { and, between, eq, sql } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/pg-core';

import { db } from '../db';
import { actions, getRemixFunctionOverviewAggregatedView, loaders } from '../schema';
import { ActionEvent, LoaderEvent, Project } from '../types';
import { toPostgresTzName } from './aggregations';
import { observable, operators, throttleTime } from './events';
import { resolveIp } from './ip';

export function createRemixFunctionInsert(schema: typeof loaders | typeof actions) {
  return async function create(project: Project, event: ActionEvent | LoaderEvent) {
    const { details } = event;
    const {
      timestamp,
      duration,
      errored,
      routeId,
      httpMethod,
      httpStatusCode,
      httpStatusText,
      version,
      adapter,
      hash,
      ip,
    } = details;

    const geo = await resolveIp(ip);

    await db({ write: true })
      .insert(schema)
      .values({
        teamId: project.teamId,
        projectId: project.id,
        timestamp: new Date(timestamp),
        duration: BigInt(duration),
        errored,
        routeId,
        httpMethod,
        httpStatusCode,
        httpStatusText,
        version,
        adapter,
        hash,
        ...geo,
      });
  };
}

export function createRemixFunctionOverview(schema: typeof loaders | typeof actions) {
  return async function overview({
    project,
    range: { from, to },
    interval = 'hour',
  }: {
    project: Project;
    range: {
      from: Temporal.ZonedDateTime;
      to: Temporal.ZonedDateTime;
    };
    interval?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<{
    count: number;
    erroredCount: number;
    duration: { p50: number | null };
  }> {
    const base = getTableConfig(schema).name;

    console.time(`${base}.overview`);

    const table = await getRemixFunctionOverviewAggregatedView({
      base,
      timeZone: from.timeZoneId,
      interval,
    });

    const fromDate = new Date(from.toInstant().epochMilliseconds);
    const toDate = new Date(to.toInstant().epochMilliseconds);

    const [
      { count, erroredCount, durationP50 } = {
        count: 0,
        erroredCount: 0,
        durationP50: null,
      },
    ] = await db()
      .select({
        count: sql<number>`sum(${table.count})::integer`,
        erroredCount: sql<number>`sum(${table.erroredCount})::integer`,
        durationP50: sql<number>`approx_percentile(0.5, rollup(${table.durationPctAgg}))`,
      })
      .from(table)
      .where(
        and(
          eq(table.teamId, project.teamId),
          eq(table.projectId, project.id),
          between(table.timestamp, fromDate, toDate),
        ),
      );

    console.timeEnd(`${base}.overview`);

    return {
      count,
      duration: { p50: durationP50 },
      erroredCount,
    };
  };
}

export function createRemixFunctionOverviewSeries(schema: typeof loaders | typeof actions) {
  return async function series({
    project,
    range: { from, to },
    interval = 'hour',
  }: {
    project: Project;
    range: {
      from: Temporal.ZonedDateTime;
      to: Temporal.ZonedDateTime;
    };
    interval?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<{
    series: {
      timestamp: number;
      count: number | null;
      erroredCount: number | null;
      okCount: number | null;
    }[];
  }> {
    const base = getTableConfig(schema).name;

    console.time(`${base}.overviewSeries`);

    const table = await getRemixFunctionOverviewAggregatedView({
      base,
      timeZone: from.timeZoneId,
      interval,
    });

    const fromDate = new Date(from.toInstant().epochMilliseconds);
    const toDate = new Date(to.toInstant().epochMilliseconds);

    const pgTz = await toPostgresTzName({ timeZoneId: from.timeZoneId });

    const result = await db()
      .select({
        // prettier-ignore
        timestamp: sql<string>`time_bucket_gapfill('1 ${sql.raw(interval)}', ${table.timestamp}, ${sql.raw(pgTz)})`,
        count: sql<number | null>`sum(${table.count})::integer`,
        erroredCount: sql<number | null>`sum(${table.erroredCount})::integer`,
        okCount: sql<number | null>`sum(${table.count} - ${table.erroredCount})::integer`,
      })
      .from(table)
      .where(
        and(
          between(table.timestamp, fromDate, toDate),
          eq(table.teamId, project.teamId),
          eq(table.projectId, project.id),
        ),
      )
      .groupBy(sql`1`);

    const series = result.map(({ timestamp, count, erroredCount, okCount }) => {
      const tsParsed = timestamp.replace(' ', 'T').replace('+00', '') + 'Z';

      return {
        timestamp: new Date(tsParsed).valueOf(),
        count,
        erroredCount,
        okCount,
      };
    });

    console.timeEnd(`${base}.overviewSeries`);
    return { series };
  };
}

export function createRemixFunctionWatch(schema: typeof loaders | typeof actions) {
  const schemaEvents: ('loader' | 'action')[] =
    getTableConfig(schema).name === 'loaders' ? ['loader'] : ['action'];

  return async function watch(
    project: Project,
    callback: (event: { ts: number }) => Promise<void>,
  ): Promise<() => void> {
    await callback({ ts: Date.now() });

    const subscription = observable
      .pipe(
        operators.project(project),
        operators.events(schemaEvents),
        throttleTime(1000, undefined, { leading: true, trailing: true }),
      )
      .subscribe(async ([e]) => {
        await callback({ ts: e.returnvalue.ts });
      });

    return () => subscription.unsubscribe();
  };
}
