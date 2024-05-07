const { clickhouse } = require('./clickhouse.cjs');
const { MergeTree } = require('./engines.cjs');

class ClickHouseStore {
  async load(fn) {
    try {
      const tablesResult = await clickhouse.query({
        query: 'SHOW TABLES',
        format: 'JSONEachRow',
      });

      const json = await tablesResult.json();

      const tableExists = json.some((row) => row.name === 'migrations');

      if (!tableExists) {
        await clickhouse.command({
          query: `CREATE TABLE migrations (migration String, applied DateTime64(3) DEFAULT now64(3)) ENGINE = ${MergeTree} ORDER BY applied;`,
        });
      }

      // Query your ClickHouse database to get the migration state
      const result = await (
        await clickhouse.query({ query: 'SELECT migration FROM migrations', format: 'JSONEachRow' })
      ).json();

      const migrations = result.map((row) => JSON.parse(row.migration));
      const lastRun = migrations[migrations.length - 1];

      const set = {
        lastRun,
        migrations,
      };

      fn(null, set);
    } catch (err) {
      fn(err);
    }
  }

  async save(set, fn) {
    try {
      const migrations = set.migrations
        .filter((migration) => migration.timestamp !== null)
        .map((migration) => ({
          migration: JSON.stringify(migration),
          applied: migration.timestamp,
        }));

      await clickhouse.query({ query: 'TRUNCATE TABLE migrations' });
      await clickhouse.insert({
        table: 'migrations',
        values: migrations,
        format: 'JSONEachRow',
      });

      fn(null);
    } catch (err) {
      fn(err);
    }
  }
}

module.exports = ClickHouseStore;
