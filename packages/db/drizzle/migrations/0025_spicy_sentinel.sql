TRUNCATE TABLE requests;
-- Custom SQL migration file, put you code below! --
SELECT create_hypertable('requests', 'timestamp', chunk_time_interval => interval '1 day');
--> statement-breakpoint
ALTER TABLE requests SET (timescaledb.compress);
--> statement-breakpoint
SELECT add_compression_policy('requests', INTERVAL '7 days');
