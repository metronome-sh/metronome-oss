ALTER TABLE "users" ADD COLUMN "strategy" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "settings" jsonb DEFAULT '{"emails":[]}'::jsonb;