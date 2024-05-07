DO $$ BEGIN
 CREATE TYPE "errors_housekeeping_status" AS ENUM('unresolved', 'resolved', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "errors_housekeeping" (
	"project_id" text NOT NULL,
	"hash" text NOT NULL,
	"status" "errors_housekeeping_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
