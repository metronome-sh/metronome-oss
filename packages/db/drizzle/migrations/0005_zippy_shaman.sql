ALTER TABLE "projects" RENAME TO "apps";--> statement-breakpoint
ALTER TABLE "apps" DROP CONSTRAINT "projects_team_id_teams_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "apps" ADD CONSTRAINT "apps_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
