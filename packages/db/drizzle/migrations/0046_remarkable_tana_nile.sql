ALTER TABLE "errors_housekeeping" ALTER COLUMN "status" SET DEFAULT 'unresolved';--> statement-breakpoint
ALTER TABLE "errors_housekeeping" ALTER COLUMN "status" DROP NOT NULL;