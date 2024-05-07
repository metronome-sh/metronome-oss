--> statement-breakpoint
SELECT create_hypertable('web_vitals', 'timestamp', chunk_time_interval => interval '1 day');
--> statement-breakpoint
ALTER TABLE web_vitals SET (timescaledb.compress);
--> statement-breakpoint
SELECT add_compression_policy('web_vitals', INTERVAL '7 days');