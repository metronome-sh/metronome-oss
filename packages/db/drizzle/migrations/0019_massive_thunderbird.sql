CREATE TABLE IF NOT EXISTS "usage" (
	"team_id" text NOT NULL,
	"project_id" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"events" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_team_timestamp_idx" ON "usage" ("team_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_project_timestamp_idx" ON "usage" ("project_id","timestamp");