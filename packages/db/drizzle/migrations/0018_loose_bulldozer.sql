ALTER TABLE "requests" RENAME COLUMN "organization_id" TO "team_id";--> statement-breakpoint
DROP INDEX IF EXISTS "organization_timestamp_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "team_timestamp_idx" ON "requests" ("team_id","timestamp");