SELECT create_hypertable('actions', 'timestamp', chunk_time_interval => interval '1 day');
--> statement-breakpoint
ALTER TABLE actions SET (timescaledb.compress);
--> statement-breakpoint
SELECT add_compression_policy('actions', INTERVAL '7 days');
--> statement-breakpoint
SELECT create_hypertable('loaders', 'timestamp', chunk_time_interval => interval '1 day');
--> statement-breakpoint
ALTER TABLE loaders SET (timescaledb.compress);
--> statement-breakpoint
SELECT add_compression_policy('loaders', INTERVAL '7 days');
