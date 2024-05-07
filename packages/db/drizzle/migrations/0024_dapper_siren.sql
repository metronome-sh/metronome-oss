ALTER TABLE usages SET (timescaledb.compress);
--> statement-breakpoint
SELECT add_retention_policy('usages', INTERVAL '7 days');
--> statement-breakpoint
CREATE MATERIALIZED VIEW usages_hourly WITH (timescaledb.continuous) AS
  SELECT 
    team_id, 
    project_id, 
    time_bucket('1 hour', "timestamp", 'UTC') AS timestamp, 
    sum(events) as events
  FROM usages
  GROUP BY 1, 2, 3
WITH NO DATA;
--> statement-breakpoint
ALTER MATERIALIZED VIEW usages_hourly set (timescaledb.compress);
--> statement-breakpoint
SELECT timescaledb_experimental.add_policies(
    'usages_hourly',
    refresh_start_offset => '2 days'::interval,
    refresh_end_offset => '1 hour'::interval,
    compress_after => '7 days'::interval,
    drop_after => '1 year'::interval
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW usages_daily WITH (timescaledb.continuous) AS
  SELECT 
    team_id, 
    project_id, 
    time_bucket('1 day', "timestamp", 'UTC') AS timestamp, 
    sum(events) as events
  FROM usages_hourly
  GROUP BY 1, 2, 3
WITH NO DATA;
--> statement-breakpoint
ALTER MATERIALIZED VIEW usages_daily set (timescaledb.compress);
--> statement-breakpoint
SELECT timescaledb_experimental.add_policies(
    'usages_daily',
    refresh_start_offset => '3 days'::interval,
    refresh_end_offset => '1 day'::interval,
    compress_after => '7 days'::interval,
    drop_after => '1 year'::interval
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW usages_weekly WITH (timescaledb.continuous) AS
  SELECT 
    team_id, 
    project_id, 
    time_bucket('1 week', "timestamp", 'UTC') AS timestamp, 
    sum(events) as events
  FROM usages_daily
  GROUP BY 1, 2, 3
WITH NO DATA;
--> statement-breakpoint
ALTER MATERIALIZED VIEW usages_weekly set (timescaledb.compress);
--> statement-breakpoint
SELECT timescaledb_experimental.add_policies(
    'usages_weekly',
    refresh_start_offset => '3 weeks'::interval,
    refresh_end_offset => '1 week'::interval,
    compress_after => '4 weeks'::interval,
    drop_after => '1 year'::interval
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW usages_monthly WITH (timescaledb.continuous) AS
  SELECT
    team_id, 
    project_id, 
    time_bucket('1 month', "timestamp", 'UTC') AS timestamp, 
    sum(events) as events
  FROM usages_daily
  GROUP BY 1, 2, 3
WITH NO DATA;
--> statement-breakpoint
ALTER MATERIALIZED VIEW usages_monthly set (timescaledb.compress);
--> statement-breakpoint
SELECT timescaledb_experimental.add_policies(
    'usages_monthly',
    refresh_start_offset => '3 months'::interval,
    refresh_end_offset => '1 month'::interval,
    compress_after => '4 months'::interval,
    drop_after => '1 year'::interval
);
