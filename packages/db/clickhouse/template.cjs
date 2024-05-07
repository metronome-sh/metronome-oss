'use strict';

const { clickhouse } = require('../clickhouse.cjs');

module.exports.up = async function () {
  await clickhouse.command({
    query: ``,
  });
};

module.exports.down = async function () {
  await clickhouse.command({
    query: ``,
  });
};
