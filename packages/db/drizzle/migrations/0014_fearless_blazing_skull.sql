ALTER TABLE "projects" ADD COLUMN "isPublic" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "visibility";