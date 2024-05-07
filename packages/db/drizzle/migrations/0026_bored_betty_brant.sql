CREATE TABLE IF NOT EXISTS "actions" (
	"team_id" text NOT NULL,
	"project_id" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"duration" bigint NOT NULL,
	"errored" boolean DEFAULT false,
	"remix_route_id" text NOT NULL,
	"remix_hash" text NOT NULL,
	"metronome_version" text NOT NULL,
	"metronome_adapter" text NOT NULL,
	"http_method" text NOT NULL,
	"http_status_code" integer NOT NULL,
	"http_status_text" text NOT NULL,
	"country_code" text DEFAULT 'unknown' NOT NULL,
	"country" text DEFAULT 'unknown' NOT NULL,
	"region" text DEFAULT 'unknown' NOT NULL,
	"city" text DEFAULT 'unknown' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loaders" (
	"team_id" text NOT NULL,
	"project_id" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"duration" bigint NOT NULL,
	"errored" boolean DEFAULT false,
	"remix_route_id" text NOT NULL,
	"remix_hash" text NOT NULL,
	"metronome_version" text NOT NULL,
	"metronome_adapter" text NOT NULL,
	"http_method" text NOT NULL,
	"http_status_code" integer NOT NULL,
	"http_status_text" text NOT NULL,
	"country_code" text DEFAULT 'unknown' NOT NULL,
	"country" text DEFAULT 'unknown' NOT NULL,
	"region" text DEFAULT 'unknown' NOT NULL,
	"city" text DEFAULT 'unknown' NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "actions_organization_timestamp_idx" ON "actions" ("team_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "actions_project_timestamp_idx" ON "actions" ("project_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "loaders_organization_timestamp_idx" ON "loaders" ("team_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "loaders_project_timestamp_idx" ON "loaders" ("project_id","timestamp");