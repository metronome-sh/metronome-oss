ALTER TABLE "web_vitals" RENAME COLUMN "organization_id" TO "team_id";--> statement-breakpoint
DROP INDEX IF EXISTS "actions_organization_timestamp_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "loaders_organization_timestamp_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "web_vitals_organization_timestamp_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "actions_team_timestamp_idx" ON "actions" ("team_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "loaders_team_timestamp_idx" ON "loaders" ("team_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "web_vitals_team_timestamp_idx" ON "web_vitals" ("team_id","timestamp");