CREATE TABLE IF NOT EXISTS "pageviews" (
	"team_id" text NOT NULL,
	"project_id" text NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text,
	"timestamp" timestamp with time zone NOT NULL,
	"route_id" text NOT NULL,
	"route_path" text NOT NULL,
	"hash" text NOT NULL,
	"url_path" text NOT NULL,
	"url_query" text NOT NULL,
	"referrer" text,
	"referrer_domain" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"team_id" text NOT NULL,
	"project_id" text NOT NULL,
	"session_id" text NOT NULL,
	"user_id" text,
	"timestamp" timestamp with time zone NOT NULL,
	"duration" bigint NOT NULL,
	"browser" text NOT NULL,
	"os" text NOT NULL,
	"device" text NOT NULL,
	"device_category" text NOT NULL,
	"screen" text NOT NULL,
	"language" text NOT NULL,
	"connection" text NOT NULL,
	"pageviews" integer DEFAULT 1,
	"country_code" text DEFAULT 'unknown' NOT NULL,
	"country" text DEFAULT 'unknown' NOT NULL,
	"region" text DEFAULT 'unknown' NOT NULL,
	"city" text DEFAULT 'unknown' NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageview_team_timestamp_idx" ON "pageviews" ("team_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageview_project_timestamp_idx" ON "pageviews" ("project_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageview_team_session_idx" ON "pageviews" ("session_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageview_team_user_idx" ON "pageviews" ("user_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pageview_team_referrer_domain_idx" ON "pageviews" ("referrer_domain","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_team_timestamp_idx" ON "sessions" ("team_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_project_timestamp_idx" ON "sessions" ("project_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_session_timestamp_idx" ON "sessions" ("session_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_timestamp_idx" ON "sessions" ("user_id","timestamp");