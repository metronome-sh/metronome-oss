ALTER TABLE "users" ALTER COLUMN "settings" SET DEFAULT '{"emails":[],"selectedEmail":null,"lastViewedProject":null}'::jsonb;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "share_slug" text;--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_share_slug_unique" UNIQUE("share_slug");