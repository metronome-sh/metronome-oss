/* eslint-disable @typescript-eslint/no-use-before-define */
import { relations } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const Method = pgEnum('http_method', [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
]);

export const RequestType = pgEnum('request_type', ['document', 'data']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password'),
  avatar: text('avatar'),
  strategy: text('strategy'),
  strategyUserId: text('strategy_user_id'),
  settings: jsonb('settings')
    .$type<{
      emails: string[];
      selectedEmail?: string | null;
      lastSelectedProjectSlug?: string | null;
      lastSelectedTeamSlug?: string | null;
    }>()
    .default({
      emails: [],
      selectedEmail: null,
      lastSelectedProjectSlug: null,
      lastSelectedTeamSlug: null,
    }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  usersToTeams: many(usersToTeams),
}));

export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  slug: text('slug').unique(),
  name: text('name'),
  description: text('description'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  usersToTeams: many(usersToTeams),
  projects: many(projects),
}));

export const usersToTeams = pgTable('users_to_teams', {
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  teamId: text('team_id')
    .notNull()
    .references(() => teams.id),
});

export const usersToTeamsRelations = relations(usersToTeams, ({ one }) => ({
  team: one(teams, {
    fields: [usersToTeams.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [usersToTeams.userId],
    references: [users.id],
  }),
}));

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  slug: text('slug').unique(),
  shareSlug: text('share_slug').unique(),
  name: text('name').notNull(),
  apiKey: text('api_key').notNull(),
  url: text('url'),
  description: text('description'),
  teamId: text('team_id')
    .references(() => teams.id)
    .notNull(),
  createdBy: text('created_by'),
  deleted: boolean('deleted').default(false),
  clientVersion: text('client_version'),
  isPublic: boolean('isPublic').default(false),
  isNew: boolean('is_new'),
  salt: text('salt'),
  runtime: text('runtime'),
  previousSalt: text('previous_salt'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const projectsRelations = relations(projects, ({ one }) => ({
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  }),
}));

export const requests = pgTable(
  'requests',
  {
    teamId: text('team_id').notNull(),
    projectId: text('project_id').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    duration: bigint('duration', { mode: 'bigint' }).notNull(),
    method: Method('method').notNull(),
    statusCode: integer('status_code').notNull(),
    pathname: text('pathname').notNull(),
    requestType: RequestType('request_type').notNull(),
    countryCode: text('country_code').notNull().default('unknown'),
    country: text('country').notNull().default('unknown'),
    region: text('region').notNull().default('unknown'),
    city: text('city').notNull().default('unknown'),
  },
  (table) => {
    return {
      teamTimestampIdx: index('team_timestamp_idx').on(
        table.teamId,
        table.timestamp,
      ),
      projectTimestampIdx: index('project_timestamp_idx').on(
        table.projectId,
        table.timestamp,
      ),
    };
  },
);

export const usages = pgTable(
  'usage',
  {
    teamId: text('team_id').notNull(),
    projectId: text('project_id').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true })
      .notNull()
      .defaultNow(),
    events: bigint('events', { mode: 'bigint' }).notNull(),
  },
  (table) => {
    return {
      teamTimestampIdx: index('usage_team_timestamp_idx').on(
        table.teamId,
        table.timestamp,
      ),
      projectTimestampIdx: index('usage_project_timestamp_idx').on(
        table.projectId,
        table.timestamp,
      ),
    };
  },
);

export function getUsagesAggregatedView({
  interval,
}: {
  interval: 'hour' | 'day' | 'week' | 'month';
}) {
  const aggregatedSchema = {
    organizationId: text('organization_id').notNull(),
    projectId: text('project_id').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    events: bigint('events', { mode: 'bigint' }).notNull(),
  };

  const usagesAggregatedTables = {
    hour: pgTable('usage_hourly', aggregatedSchema),
    day: pgTable('usage_daily', aggregatedSchema),
    week: pgTable('usage_weekly', aggregatedSchema),
    month: pgTable('usage_monthly', aggregatedSchema),
  };

  return usagesAggregatedTables[interval];
}
