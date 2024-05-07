--> statement-breakpoint
SELECT create_hypertable('sessions', 'timestamp', chunk_time_interval => interval '1 day');
--> statement-breakpoint
ALTER TABLE sessions SET (timescaledb.compress);
--> statement-breakpoint
SELECT add_compression_policy('sessions', INTERVAL '7 days');
--> statement-breakpoint
SELECT create_hypertable('pageviews', 'timestamp', chunk_time_interval => interval '1 day');
--> statement-breakpoint
ALTER TABLE pageviews SET (timescaledb.compress);
--> statement-breakpoint
SELECT add_compression_policy('pageviews', INTERVAL '7 days');