'use strict';

const { clickhouse } = require('../clickhouse.cjs');
const { MergeTree } = require('../engines.cjs');

module.exports.up = async function () {
  await clickhouse.command({
    query: `
      CREATE TABLE sourcemaps
      (
          project_id String,
          version String,
          deleted Bool DEFAULT false,
          created_at DateTime DEFAULT now(),
          updated_at DateTime DEFAULT now()
      )
      ENGINE = ${MergeTree}
      PARTITION BY toYYYYMM(created_at)
      ORDER BY (project_id, version, created_at)
      SETTINGS index_granularity = 8192;    
    `,
  });
};

module.exports.down = async function () {
  await clickhouse.command({
    query: `
      DROP TABLE IF EXISTS sourcemaps;
    `,
  });
};
