'use strict';

const { clickhouse } = require('../clickhouse.cjs');

module.exports.up = async function () {
  await clickhouse.command({
    query: `
      CREATE MATERIALIZED VIEW IF NOT EXISTS events_to_errors_mv TO errors AS
      SELECT
        project_id,
        lower(hex(MD5(concat(
          arrayElement(arrayFilter(x -> (x.1 = 'exception.type'), arrayZip(e.event_attributes.key, e.event_attributes.value)), 1).2,
          arrayElement(arrayFilter(x -> (x.1 = 'exception.message'), arrayZip(e.event_attributes.key, e.event_attributes.value)), 1).2,
          arrayElement(arrayFilter(x -> (x.1 = 'exception.stacktrace'), arrayZip(e.event_attributes.key, e.event_attributes.value)), 1).2
        )))) as hash,
        count() AS occurrences,
        any(s.kind) AS kind,
        any(arrayElement(arrayFilter(x -> (x.1 = 'exception.type'), arrayZip(e.event_attributes.key, e.event_attributes.value)), 1).2) AS name,
        any(arrayElement(arrayFilter(x -> (x.1 = 'exception.message'), arrayZip(e.event_attributes.key, e.event_attributes.value)), 1).2) AS message,
        any(arrayElement(arrayFilter(x -> (x.1 = 'exception.stacktrace'), arrayZip(e.event_attributes.key, e.event_attributes.value)), 1).2) AS stacktrace,
        groupUniqArrayState(arrayElement(arrayFilter(x -> (x.1 = 'app.version'), arrayZip(s.span_attributes.key, s.span_attributes.value)), 1).2) AS versions,
        groupUniqArrayState(arrayElement(arrayFilter(x -> (x.1 = 'remix.route_id'), arrayZip(s.span_attributes.key, s.span_attributes.value)), 1).2) AS route_ids,
        minState(timestamp) as first_seen,
        maxState(timestamp) AS last_seen,
        groupUniqArrayState(id) AS event_ids
      FROM events e
      JOIN spans s ON e.span_id = s.span_id
      GROUP BY project_id, hash
    `,
  });
};

module.exports.down = async function () {
  await clickhouse.command({
    query: `DROP VIEW IF EXISTS events_to_errors_mv;`,
  });
};
