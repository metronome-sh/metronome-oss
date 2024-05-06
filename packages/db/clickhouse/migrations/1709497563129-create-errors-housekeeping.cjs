'use strict';

const { clickhouse } = require('../clickhouse.cjs');
const { ReplacingMergeTree } = require('../engines.cjs');

module.exports.up = async function () {
  await clickhouse.command({
    query: `
      CREATE TABLE errors_housekeeping (
          project_id String,
          hash String,
          status LowCardinality(String),
          last_updated DateTime64(3) DEFAULT now64(3),
      ) ENGINE = ${ReplacingMergeTree}(last_updated)
      PARTITION BY toYYYYMM(last_updated)
      ORDER BY (project_id, hash)
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
