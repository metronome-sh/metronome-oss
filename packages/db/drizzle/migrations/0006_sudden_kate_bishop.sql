ALTER TABLE "apps" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_slug_unique" UNIQUE("slug");