ALTER TABLE "pageviews" ADD COLUMN "country_code" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "pageviews" ADD COLUMN "country" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "pageviews" ADD COLUMN "region" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "pageviews" ADD COLUMN "city" text DEFAULT 'unknown' NOT NULL;