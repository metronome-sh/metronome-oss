import { cache } from '@metronome/cache';
import { sql } from 'drizzle-orm';

import { db } from '../db';
import { Interval } from '../types';
import { getTimeZoneOffset } from './timeZones';

const postgresTzs = new Map<string, string>();

export async function toPostgresTzName(
  options: { offset: string; timeZoneId?: never } | { offset?: never; timeZoneId: string },
) {
  const key = JSON.stringify(options);

  if (postgresTzs.has(key)) {
    return postgresTzs.get(key) as string;
  }

  let name = 'UTC';

  const offset = options.offset ?? (await getTimeZoneOffset(options.timeZoneId));

  const {
    rows: [result],
  } = await db().execute(
    sql`SELECT name FROM pg_timezone_names WHERE utc_offset = ${offset} LIMIT 1;`,
  );

  if (result) {
    name = `'${result.name}'` as string;
  }

  postgresTzs.set(key, name);

  return name;
}

export function tableName({
  base,
  offset,
  interval,
}: {
  base: string;
  offset: string;
  interval: Interval;
}) {
  return `${base}_[${interval}]_[${offset}]`;
}

function quotedTableName(...params: Parameters<typeof tableName>) {
  return `"${tableName(...params)}"`;
}

const existsCache: Set<string> = new Set();

export async function timeOffsetAggregatedTableExists({
  base,
  offset,
  interval,
}: {
  base: string;
  offset: string;
  interval: 'hour' | 'day' | 'week' | 'month';
}) {
  const name = tableName({ base, offset, interval });

  if (existsCache.has(name)) {
    return true;
  }

  // prettier-ignore
  const result = await db().execute(sql`SELECT 1 FROM pg_views WHERE viewname = ${name};`);
  const exists = result.rows.length > 0;

  if (exists) existsCache.add(name);

  return !!exists;
}

export async function createTimeOffsetAggregatedView({
  from,
  base,
  offset,
  definitions,
  interval,
}: {
  from: string;
  base: string;
  offset: string;
  interval: 'hour' | 'day' | 'week' | 'month';
  definitions: {
    hour: (args: { baseTable: string; timeZone: string }) => ReturnType<typeof sql>;
    day: (args: { hourTable: string; timeZone: string }) => ReturnType<typeof sql>;
    week: (args: { dayTable: string; timeZone: string }) => ReturnType<typeof sql>;
    month: (args: { dayTable: string; timeZone: string }) => ReturnType<typeof sql>;
  };
}) {
  const lock = await cache.lock([from, base, offset, interval], 20_000);

  // Check if table exists already and return if it does once adquired the lock
  if (await timeOffsetAggregatedTableExists({ base, offset, interval })) {
    await lock.release();
    return;
  }

  const pgTz = await toPostgresTzName({ offset });

  const hourTable = quotedTableName({ base, offset, interval: 'hour' });
  const dayTable = quotedTableName({ base, offset, interval: 'day' });
  const weekTable = quotedTableName({ base, offset, interval: 'week' });
  const monthTable = quotedTableName({ base, offset, interval: 'month' });

  const createHourTable = async () => {
    // Check if table exists
    if (await timeOffsetAggregatedTableExists({ base, offset, interval: 'hour' })) {
      return;
    }

    const createHourSql = sql.empty();
    // prettier-ignore
    createHourSql.append(sql`CREATE MATERIALIZED VIEW IF NOT EXISTS ${sql.raw(hourTable)} WITH (timescaledb.continuous) AS `);
    createHourSql.append(definitions.hour({ baseTable: from, timeZone: pgTz }));
    createHourSql.append(sql`WITH NO DATA;`);

    await db({ write: true }).execute(createHourSql);

    // prettier-ignore
    const realtimeSql = sql`ALTER MATERIALIZED VIEW ${sql.raw(hourTable)} set (timescaledb.materialized_only = false);`;

    await db({ write: true }).execute(realtimeSql);

    const compressHourSql = sql`
      ALTER MATERIALIZED VIEW ${sql.raw(hourTable)} set (timescaledb.compress);
    `;

    await db({ write: true }).execute(compressHourSql);

    const policiesHourSql = sql`
      SELECT timescaledb_experimental.add_policies(
        ${sql.raw(hourTable.replaceAll('"', "'"))},
        refresh_start_offset => '2 days'::interval,
        refresh_end_offset => '1 hour'::interval,
        compress_after => '7 days'::interval,
        drop_after => '1 year'::interval
      );
    `;

    await db({ write: true }).execute(policiesHourSql);

    // const delay = Math.floor(Math.random() * (10 - 1 + 1) + 1) * 60 * 1000;

    // await queues.aggregations.add(
    //   { aggregation: hourTable, watermark: '1 hour' },
    //   { jobId: hourTable, delay },
    // );
  };

  const createDayTable = async () => {
    // Check if table exists
    if (await timeOffsetAggregatedTableExists({ base, offset, interval: 'day' })) {
      return;
    }

    const createDaySql = sql.empty();
    // prettier-ignore
    createDaySql.append(sql`CREATE MATERIALIZED VIEW IF NOT EXISTS ${sql.raw(dayTable)} WITH (timescaledb.continuous) AS `);
    createDaySql.append(definitions.day({ hourTable, timeZone: pgTz }));
    createDaySql.append(sql`WITH NO DATA;`);

    await db({ write: true }).execute(createDaySql);

    // prettier-ignore
    const realtimeSql = sql`ALTER MATERIALIZED VIEW ${sql.raw(dayTable)} set (timescaledb.materialized_only = false);`;

    await db({ write: true }).execute(realtimeSql);

    const compressDaySql = sql`
      ALTER MATERIALIZED VIEW ${sql.raw(dayTable)} set (timescaledb.compress);
    `;

    await db({ write: true }).execute(compressDaySql);

    const policiesDaySql = sql`
      SELECT timescaledb_experimental.add_policies(
        ${sql.raw(dayTable.replaceAll('"', "'"))},
        refresh_start_offset => '3 days'::interval,
        refresh_end_offset => '1 day'::interval,
        compress_after => '7 days'::interval,
        drop_after => '1 year'::interval
      );
    `;

    await db({ write: true }).execute(policiesDaySql);

    // const delay = Math.floor(Math.random() * (10 - 1 + 1) + 1) * 60 * 1000;

    // await queues.aggregations.add(
    //   { aggregation: dayTable, watermark: '1 day' },
    //   { jobId: dayTable, delay },
    // );
  };

  const createWeekTable = async () => {
    // Check if table exists
    if (await timeOffsetAggregatedTableExists({ base, offset, interval: 'week' })) {
      return;
    }

    // Week interval
    const createWeekSql = sql.empty();
    // prettier-ignore
    createWeekSql.append(sql`CREATE MATERIALIZED VIEW IF NOT EXISTS ${sql.raw(weekTable)} WITH (timescaledb.continuous) AS `);
    createWeekSql.append(definitions.week({ dayTable, timeZone: pgTz }));
    createWeekSql.append(sql`WITH NO DATA;`);

    await db({ write: true }).execute(createWeekSql);

    // prettier-ignore
    const realtimeSql = sql`ALTER MATERIALIZED VIEW ${sql.raw(weekTable)} set (timescaledb.materialized_only = false);`;

    await db({ write: true }).execute(realtimeSql);

    const compressWeekSql = sql`
      ALTER MATERIALIZED VIEW ${sql.raw(weekTable)} set (timescaledb.compress);
    `;

    await db({ write: true }).execute(compressWeekSql);

    const policiesWeekSql = sql`
      SELECT timescaledb_experimental.add_policies(
        ${sql.raw(weekTable.replaceAll('"', "'"))},
        refresh_start_offset => '3 weeks'::interval,
        refresh_end_offset => '1 week'::interval,
        compress_after => '4 weeks'::interval,
        drop_after => '1 year'::interval
      );
    `;

    await db({ write: true }).execute(policiesWeekSql);

    // const delay = Math.floor(Math.random() * (10 - 1 + 1) + 1) * 60 * 1000;

    // await queues.aggregations.add(
    //   { aggregation: weekTable, watermark: '1 week' },
    //   { jobId: weekTable, delay },
    // );
  };

  const createMonthTable = async () => {
    // Check if table exists
    if (await timeOffsetAggregatedTableExists({ base, offset, interval: 'month' })) {
      return;
    }

    // Month interval
    const createMonthSql = sql.empty();
    // prettier-ignore
    createMonthSql.append(sql`CREATE MATERIALIZED VIEW IF NOT EXISTS ${sql.raw(monthTable)} WITH (timescaledb.continuous) AS `);
    createMonthSql.append(definitions.month({ dayTable, timeZone: pgTz }));
    createMonthSql.append(sql`WITH NO DATA;`);

    await db({ write: true }).execute(createMonthSql);

    // prettier-ignore
    const realtimeSql = sql`ALTER MATERIALIZED VIEW ${sql.raw(monthTable)} set (timescaledb.materialized_only = false);`;

    await db({ write: true }).execute(realtimeSql);

    const compressMonthSql = sql`
    ALTER MATERIALIZED VIEW ${sql.raw(monthTable)} set (timescaledb.compress);
  `;

    await db({ write: true }).execute(compressMonthSql);

    const policiesMonthSql = sql`
      SELECT timescaledb_experimental.add_policies(
        ${sql.raw(monthTable.replaceAll('"', "'"))},
        refresh_start_offset => '4 months'::interval,
        refresh_end_offset => '1 month'::interval,
        compress_after => '6 months'::interval,
        drop_after => '1 year'::interval
      );
    `;

    await db({ write: true }).execute(policiesMonthSql);

    // const delay = Math.floor(Math.random() * (10 - 1 + 1) + 1) * 60 * 1000;

    // await queues.aggregations.add(
    //   { aggregation: monthTable, watermark: '1 month' },
    //   { jobId: monthTable, delay },
    // );
  };

  if (interval === 'hour') {
    await createHourTable();
  } else if (interval === 'day') {
    await createHourTable();
    await createDayTable();
  } else if (interval === 'week') {
    await createHourTable();
    await createDayTable();
    await createWeekTable();
  } else if (interval === 'month') {
    await createHourTable();
    await createDayTable();
    await createMonthTable();
  }

  await lock.release();
}

export async function refreshAggregation({
  aggregation,
  watermark,
}: {
  aggregation: string;
  watermark: string;
}) {
  const refreshContinuous = (interval: string) => {
    // prettier-ignore
    return db({ write: true }).execute(sql`CALL refresh_continuous_aggregate('${sql.raw(aggregation)}', '2023-01-01', date_trunc('${sql.raw(interval)}', now() - interval '1 ${sql.raw(interval)}'));`);
  };

  console.log(`Refreshing aggregation ${aggregation} with watermark ${watermark}`);

  if (watermark === '1 hour') {
    return refreshContinuous('hour');
  }

  if (watermark === '1 day') {
    return refreshContinuous('day');
  }

  if (watermark === '1 week') {
    return refreshContinuous('week');
  }

  if (watermark === '1 month') {
    return refreshContinuous('month');
  }

  throw new Error(`Unknown watermark ${watermark}`);
}
