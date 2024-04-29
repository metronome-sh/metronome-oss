'use strict';

const { clickhouse } = require('../clickhouse.cjs');

module.exports.up = async function () {
  await clickhouse.command({
    query: `
      CREATE TABLE errors_housekeeping (
          project_id String,
          hash String,
          status LowCardinality(String),
          last_updated DateTime64(3) DEFAULT now64(3),
          version UInt64 DEFAULT 1
      ) ENGINE = ReplacingMergeTree(version)
      PARTITION BY toYYYYMM(last_updated)
      ORDER BY (project_id, hash, last_updated)
    `,
  });
};

module.exports.down = async function () {
  await clickhouse.command({
    query: `
      DROP TABLE IF EXISTS errors_housekeeping;
    `,
  });
};
