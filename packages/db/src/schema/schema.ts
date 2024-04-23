/* eslint-disable @typescript-eslint/no-use-before-define */
import { relations } from 'drizzle-orm';
import {
  bigint,
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const Method = pgEnum('http_method', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);

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
      customerId: string | null;
      seenNotifications?: string[];
      lastErrorVisitedAt?: number;
    }>()
    .default({
      emails: [],
      seenNotifications: [],
      selectedEmail: null,
      lastSelectedProjectSlug: null,
      lastSelectedTeamSlug: null,
      customerId: null,
      lastErrorVisitedAt: undefined,
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
  settings: jsonb('settings')
    .$type<{
      isLegacyFreeUser?: boolean;
      subscription: {
        subscriptionId: string;
        status: 'active' | 'cancelled' | 'past_due' | 'unpaid' | string;
        currentPeriodEnd: number;
        cancellationDate: number | null;
        trialEnd: number | null;
      } | null;
    }>()
    .default({
      subscription: null,
    }),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  usersToTeams: many(usersToTeams),
  projects: many(projects),
}));

export const usersToTeams = pgTable(
  'users_to_teams',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    teamId: text('team_id')
      .notNull()
      .references(() => teams.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.teamId] }),
    };
  },
);

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
  clientVersion: text('client_version').default('0.0.0'),
  isPublic: boolean('isPublic').default(false),
  isNew: boolean('is_new').notNull().default(true),
  salt: text('salt'),
  runtime: text('runtime'),
  previousSalt: text('previous_salt'),
  isUsingVite: boolean('is_using_vite').default(false),
  isCloudflare: boolean('is_cloudflare').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const projectsRelations = relations(projects, ({ one }) => ({
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  }),
}));

const geo = {
  countryCode: text('country_code').notNull().default('unknown'),
  country: text('country').notNull().default('unknown'),
  region: text('region').notNull().default('unknown'),
  city: text('city').notNull().default('unknown'),
};

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
    ...geo,
  },
  (table) => {
    return {
      teamTimestampIdx: index('team_timestamp_idx').on(table.teamId, table.timestamp),
      projectTimestampIdx: index('project_timestamp_idx').on(table.projectId, table.timestamp),
    };
  },
);

export const usages = pgTable(
  'usages',
  {
    teamId: text('team_id').notNull(),
    projectId: text('project_id').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
    events: bigint('events', { mode: 'bigint' }).notNull(),
  },
  (table) => {
    return {
      teamTimestampIdx: index('usage_team_timestamp_idx').on(table.teamId, table.timestamp),
      projectTimestampIdx: index('usage_project_timestamp_idx').on(
        table.projectId,
        table.timestamp,
      ),
    };
  },
);

const remixFunctionSchema = {
  teamId: text('team_id').notNull(),
  projectId: text('project_id').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  duration: bigint('duration', { mode: 'bigint' }).notNull(),
  errored: boolean('errored').default(false),
  routeId: text('remix_route_id').notNull(),
  hash: text('remix_hash').notNull(),
  version: text('metronome_version').notNull(),
  adapter: text('metronome_adapter').notNull(),
  httpMethod: text('http_method').notNull(),
  httpStatusCode: integer('http_status_code').notNull(),
  httpStatusText: text('http_status_text').notNull(),
  ...geo,
};

export const loaders = pgTable('loaders', remixFunctionSchema, (table) => {
  return {
    teampTimestampIdx: index('loaders_team_timestamp_idx').on(table.teamId, table.timestamp),
    projectTimestampIdx: index('loaders_project_timestamp_idx').on(
      table.projectId,
      table.timestamp,
    ),
  };
});

export const actions = pgTable('actions', remixFunctionSchema, (table) => {
  return {
    teampTimestampIdx: index('actions_team_timestamp_idx').on(table.teamId, table.timestamp),
    projectTimestampIdx: index('actions_project_timestamp_idx').on(
      table.projectId,
      table.timestamp,
    ),
  };
});

export const webVitalName = pgEnum('web_vital_name', ['LCP', 'FCP', 'FID', 'CLS', 'TTFB', 'INP']);

export const webVitals = pgTable(
  'web_vitals',
  {
    teamId: text('team_id').notNull(),
    projectId: text('project_id').notNull(),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    name: webVitalName('name').notNull(),
    value: decimal('value').notNull(),
    deviceType: text('device_type').notNull(),
    deviceCategory: text('device_category').notNull(),
    deviceConnection: text('device_connection').notNull(),
    routeId: text('remix_route_id').notNull(),
    pathname: text('remix_pathname').notNull(),
    ...geo,
  },
  (table) => {
    return {
      teampTimestampIdx: index('web_vitals_team_timestamp_idx').on(table.teamId, table.timestamp),
      projectTimestampIdx: index('web_vitals_project_timestamp_idx').on(
        table.projectId,
        table.timestamp,
      ),
      nameTimestampIdx: index('web_vitals_name_timestamp_idx').on(table.name, table.timestamp),
    };
  },
);

export const sessions = pgTable(
  'sessions',
  {
    teamId: text('team_id').notNull(),
    projectId: text('project_id').notNull(),
    sessionId: text('session_id').notNull(),
    userId: text('user_id'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    duration: bigint('duration', { mode: 'bigint' }).notNull(),
    browser: text('browser').notNull(),
    os: text('os').notNull(),
    device: text('device').notNull(),
    deviceCategory: text('device_category').notNull(),
    screen: text('screen').notNull(),
    language: text('language').notNull(),
    connection: text('connection').notNull(),
    pageviews: integer('pageviews').default(1),
    ...geo,
  },
  (table) => {
    return {
      teamTimestampIdx: index('session_team_timestamp_idx').on(table.teamId, table.timestamp),
      projectTimestampIdx: index('session_project_timestamp_idx').on(
        table.projectId,
        table.timestamp,
      ),
      sessionTimestampIdx: index('session_session_timestamp_idx').on(
        table.sessionId,
        table.timestamp,
      ),
      userTimestampIdx: index('session_user_timestamp_idx').on(table.userId, table.timestamp),
    };
  },
);

export const pageviews = pgTable(
  'pageviews',
  {
    teamId: text('team_id').notNull(),
    projectId: text('project_id').notNull(),
    sessionId: text('session_id').notNull(),
    userId: text('user_id'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    routeId: text('route_id').notNull(),
    routePath: text('route_path').notNull(),
    hash: text('hash').notNull(),
    urlPath: text('url_path').notNull(),
    urlQuery: text('url_query').notNull(),
    referrer: text('referrer'),
    referrerDomain: text('referrer_domain'),
    ...geo,
  },
  (table) => {
    return {
      teamTimestampIdx: index('pageview_team_timestamp_idx').on(table.teamId, table.timestamp),
      projectTimestampIdx: index('pageview_project_timestamp_idx').on(
        table.projectId,
        table.timestamp,
      ),
      sessionIdTimestampIdx: index('pageview_team_session_idx').on(
        table.sessionId,
        table.timestamp,
      ),
      userIdTimestampIdx: index('pageview_team_user_idx').on(table.userId, table.timestamp),
      referrerDomainTimestampIdx: index('pageview_team_referrer_domain_idx').on(
        table.referrerDomain,
        table.timestamp,
      ),
    };
  },
);

export const ErrorHousekeepingStatus = pgEnum('errors_housekeeping_status', [
  'unresolved',
  'resolved',
  'archived',
]);

export const errorsHousekeeping = pgTable(
  'errors_housekeeping',
  {
    projectId: text('project_id').notNull(),
    hash: text('hash').notNull(),
    status: ErrorHousekeepingStatus('status').default('unresolved'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.projectId, table.hash] }),
    };
  },
);
