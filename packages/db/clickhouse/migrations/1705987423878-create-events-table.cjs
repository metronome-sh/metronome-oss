'use strict';

const { clickhouse } = require('../clickhouse.cjs');
const { MergeTree } = require('../engines.cjs');

module.exports.up = async function () {
  await clickhouse.command({
    query: `
      CREATE TABLE events (
        id UUID DEFAULT generateUUIDv4(),
        project_id String,
        trace_id String,
        span_id String,
        timestamp UInt64,
        name String,
        event_attributes Nested (key String, value String),
      ) ENGINE = ${MergeTree}
      ORDER BY (timestamp, project_id, trace_id, span_id);
    `,
  });
};

module.exports.down = async function () {
  await clickhouse.command({
    query: `DROP TABLE IF EXISTS events;`,
  });
};
