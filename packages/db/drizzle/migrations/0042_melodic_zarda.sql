ALTER TABLE "projects" ALTER COLUMN "client_version" SET DEFAULT '0.0.0';--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "version";