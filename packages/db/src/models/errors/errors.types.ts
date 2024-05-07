import { SetFieldType } from 'type-fest';

export type ProjectError = {
  occurrences: number;
  hash: string;
  kind: number;
  name: string;
  message: string;
  versions: string[];
  firstSeen: number;
  lastSeen: number;
  eventIds: string[];
  routeIds: string[];
  status: ErrorHousekeepingStatus;
};

export type ClickHouseProjectErrorListItem = SetFieldType<
  ProjectError,
  'firstSeen' | 'lastSeen',
  string
>;

export type ClickHouseProjectError = ClickHouseProjectErrorListItem & {
  stacktrace: string;
};

export type ProjectErrorWithStacktrace = ProjectError & {
  stacktrace: string;
};

export type ErrorHousekeeping = {
  project_id: string;
  hash: string;
  status: 'unresolved' | 'resolved' | 'archived';
  last_updated: number;
  version: number;
};

export type ErrorHousekeepingStatus = NonNullable<ErrorHousekeeping['status']>;
