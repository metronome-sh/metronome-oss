ALTER TABLE "apps" RENAME TO "projects";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "apps_slug_unique";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "apps_share_slug_unique";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "apps_team_id_teams_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_share_slug_unique" UNIQUE("share_slug");