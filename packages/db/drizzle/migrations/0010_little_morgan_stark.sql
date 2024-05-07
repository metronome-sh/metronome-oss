ALTER TABLE "projects" ALTER COLUMN "team_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "created_by" text NOT NULL;