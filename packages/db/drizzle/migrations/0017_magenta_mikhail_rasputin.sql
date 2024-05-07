DO $$ BEGIN
 CREATE TYPE "http_method" AS ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "request_type" AS ENUM('document', 'data');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "requests" (
	"organization_id" text NOT NULL,
	"project_id" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"duration" bigint NOT NULL,
	"method" "http_method" NOT NULL,
	"status_code" integer NOT NULL,
	"pathname" text NOT NULL,
	"request_type" "request_type" NOT NULL,
	"country_code" text DEFAULT 'unknown' NOT NULL,
	"country" text DEFAULT 'unknown' NOT NULL,
	"region" text DEFAULT 'unknown' NOT NULL,
	"city" text DEFAULT 'unknown' NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_timestamp_idx" ON "requests" ("organization_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_timestamp_idx" ON "requests" ("project_id","timestamp");