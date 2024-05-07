DO $$ BEGIN
 CREATE TYPE "web_vital_name" AS ENUM('LCP', 'FCP', 'FID', 'CLS', 'TTFB', 'INP');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "web_vitals" (
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"name" "web_vital_name" NOT NULL,
	"value" numeric NOT NULL,
	"device_type" text NOT NULL,
	"device_category" text NOT NULL,
	"device_connection" text NOT NULL,
	"remix_route_id" text NOT NULL,
	"remix_pathname" text NOT NULL,
	"country_code" text DEFAULT 'unknown' NOT NULL,
	"country" text DEFAULT 'unknown' NOT NULL,
	"region" text DEFAULT 'unknown' NOT NULL,
	"city" text DEFAULT 'unknown' NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "web_vitals_organization_timestamp_idx" ON "web_vitals" ("organization_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "web_vitals_project_timestamp_idx" ON "web_vitals" ("project_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "web_vitals_name_timestamp_idx" ON "web_vitals" ("name","timestamp");