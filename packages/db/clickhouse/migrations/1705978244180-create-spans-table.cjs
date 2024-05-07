'use strict';

const { clickhouse } = require('../clickhouse.cjs');
const { MergeTree } = require('../engines.cjs');

module.exports.up = async function () {
  await clickhouse.command({
    query: `
      CREATE TABLE spans (
        project_id String,
        trace_id String,
        span_id String,
        kind UInt8,
        parent_span_id Nullable(String),
        name String,
        start_time UInt64,
        end_time UInt64,
        span_attributes Nested (
            key String,
            value String
        ),
        INDEX project_idx project_id TYPE minmax GRANULARITY 4
      ) ENGINE = ${MergeTree}
      PARTITION BY toStartOfDay(toDateTime(start_time / 1000))
      ORDER BY (start_time, project_id, trace_id, span_id);  
    `,
  });
};

module.exports.down = async function () {
  await clickhouse.command({
    query: `DROP TABLE IF EXISTS spans;`,
  });
};
