ALTER TABLE "users_to_teams" DROP CONSTRAINT "users_to_teams_user_id_team_id";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "settings" SET DEFAULT '{"emails":[],"seenNotifications":[],"selectedEmail":null,"lastSelectedProjectSlug":null,"lastSelectedTeamSlug":null,"customerId":null}'::jsonb;--> statement-breakpoint
ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_user_id_team_id_pk" PRIMARY KEY("user_id","team_id");--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "version" text DEFAULT '0.0.0';