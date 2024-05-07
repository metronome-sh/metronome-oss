SELECT create_hypertable('usage', 'timestamp', chunk_time_interval => interval '1 day');
--> statement-breakpoint
ALTER TABLE usage SET (timescaledb.compress);
--> statement-breakpoint
SELECT add_compression_policy('usage', INTERVAL '7 days');
--> statement-breakpoint
CREATE MATERIALIZED VIEW usage_hourly WITH (timescaledb.continuous) AS
  SELECT 
    team_id, 
    project_id, 
    time_bucket('1 hour', "timestamp", 'UTC') AS timestamp, 
    sum(events) as events
  FROM usage
  GROUP BY 1, 2, 3
WITH NO DATA;
--> statement-breakpoint
ALTER MATERIALIZED VIEW usage_hourly set (timescaledb.compress);
--> statement-breakpoint
SELECT timescaledb_experimental.add_policies(
    'usage_hourly',
    refresh_start_offset => '2 days'::interval,
    refresh_end_offset => '1 hour'::interval,
    compress_after => '7 days'::interval,
    drop_after => '1 year'::interval
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW usage_daily WITH (timescaledb.continuous) AS
  SELECT 
    team_id, 
    project_id, 
    time_bucket('1 day', "timestamp", 'UTC') AS timestamp, 
    sum(events) as events
  FROM usage_hourly
  GROUP BY 1, 2, 3
WITH NO DATA;
--> statement-breakpoint
ALTER MATERIALIZED VIEW usage_daily set (timescaledb.compress);
--> statement-breakpoint
SELECT timescaledb_experimental.add_policies(
    'usage_daily',
    refresh_start_offset => '3 days'::interval,
    refresh_end_offset => '1 day'::interval,
    compress_after => '7 days'::interval,
    drop_after => '1 year'::interval
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW usage_weekly WITH (timescaledb.continuous) AS
  SELECT 
    team_id, 
    project_id, 
    time_bucket('1 week', "timestamp", 'UTC') AS timestamp, 
    sum(events) as events
  FROM usage_daily
  GROUP BY 1, 2, 3
WITH NO DATA;
--> statement-breakpoint
ALTER MATERIALIZED VIEW usage_weekly set (timescaledb.compress);
--> statement-breakpoint
SELECT timescaledb_experimental.add_policies(
    'usage_weekly',
    refresh_start_offset => '3 weeks'::interval,
    refresh_end_offset => '1 week'::interval,
    compress_after => '4 weeks'::interval,
    drop_after => '1 year'::interval
);
--> statement-breakpoint
CREATE MATERIALIZED VIEW usage_monthly WITH (timescaledb.continuous) AS
  SELECT
    team_id, 
    project_id, 
    time_bucket('1 month', "timestamp", 'UTC') AS timestamp, 
    sum(events) as events
  FROM usage_daily
  GROUP BY 1, 2, 3
WITH NO DATA;
--> statement-breakpoint
ALTER MATERIALIZED VIEW usage_monthly set (timescaledb.compress);
--> statement-breakpoint
SELECT timescaledb_experimental.add_policies(
    'usage_monthly',
    refresh_start_offset => '3 months'::interval,
    refresh_end_offset => '1 month'::interval,
    compress_after => '4 months'::interval,
    drop_after => '1 year'::interval
);
