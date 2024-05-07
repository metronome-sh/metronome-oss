'use strict';

const { clickhouse } = require('../clickhouse.cjs');
const { AggregatingMergeTree } = require('../engines.cjs');

module.exports.up = async function () {
  await clickhouse.command({
    query: `
      CREATE TABLE errors (
        project_id String,
        hash FixedString(32),
        kind UInt8,
        occurrences SimpleAggregateFunction(sum, UInt64),
        name String,
        message String,
        stacktrace String,
        first_seen AggregateFunction(min, UInt64),
        last_seen AggregateFunction(max, UInt64),
        versions AggregateFunction(groupUniqArray, String),
        event_ids AggregateFunction(groupUniqArray, UUID),
        route_ids AggregateFunction(groupUniqArray, String)
      ) ENGINE = ${AggregatingMergeTree}
      ORDER BY (project_id, hash);
    `,
  });
};

module.exports.down = async function () {
  await clickhouse.command({
    query: `DROP TABLE IF EXISTS errors;`,
  });
};
