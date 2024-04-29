import { queues } from '@metronome/queues';
import crypto from 'crypto';
import { invariant } from 'ts-invariant';

import { clickhouse } from '../../modules/clickhouse';
import { Project, Range, User } from '../../types';
import { observable, operators, throttleTime } from '../../utils/events';
import { ClickHouseEvent } from '../events/events.types';
import {
  ClickHouseProjectError,
  ClickHouseProjectErrorListItem,
  ErrorHousekeepingStatus,
  ProjectError,
  ProjectErrorWithStacktrace,
} from './errors.types';

export async function createErrorHouseKeepingFromEvents({
  events,
  project,
}: {
  events: ClickHouseEvent[];
  project: Project;
}) {
  const exceptions = events.filter((event) => event.name === 'exception');

  const keys = ['exception.type', 'exception.message', 'exception.stacktrace'];

  const hashes = exceptions.map((exception) => {
    const getValue = (key: string) => {
      return exception['event_attributes.value'][exception['event_attributes.key'].indexOf(key)];
    };
    return crypto.createHash('md5').update(keys.map(getValue).join('')).digest('hex');
  });

  const values = hashes.map((hash) => ({
    projectId: project.id,
    hash,
    status: 'unresolved' as const,
  }));

  if (values.length === 0) return;

  // Create update errors housekeeping values
  const errorsHousekeepingValues = hashes.map((hash) => {
    return {
      project_id: project.id,
      hash,
      status: 'unresolved' as const,
      last_updated: new Date().valueOf(),
    };
  });

  await clickhouse.insert({
    table: 'errors_housekeeping',
    values: errorsHousekeepingValues,
    format: 'JSONEachRow',
  });

  await queues.events.add({
    eventsNames: ['errors-changed'],
    projectId: project.id,
    ts: Date.now(),
  });
}

export async function all({
  project,
  range,
  status,
}: {
  project: Project;
  status: ErrorHousekeepingStatus;
  range: Range;
}): Promise<ProjectError[]> {
  const result = await clickhouse.query({
    query: `
      select
        sum(occurrences) as occurrences,
        hash,
        any(kind) as kind,
        any(name) as name,
        any(message) as message,
        any(status) as status,
        minMerge(first_seen) as firstSeen,
        maxMerge(last_seen) as lastSeen,
        groupUniqArrayMerge(versions) as versions,
        groupUniqArrayMerge(event_ids) as eventIds,
        groupUniqArrayMerge(route_ids) as routeIds
      from
        errors
      inner join (
        select *
        from errors_housekeeping
        where (project_id, hash, last_updated) in (
          select project_id, hash, max(last_updated) as last_updated
          from errors_housekeeping
          where project_id = {projectId: String}
          group by project_id, hash
        )
      ) as errors_housekeeping
        on errors.hash = errors_housekeeping.hash
        and errors.project_id = errors_housekeeping.project_id
        and errors_housekeeping.status = {status: String}
      where
        project_id = {projectId: String}
      group by
        hash
      having
        occurrences > 0
        and lastSeen >= {from: UInt64}
        and lastSeen <= {to: UInt64}
      order by
        lastSeen desc
    `,
    format: 'JSONEachRow',
    query_params: {
      projectId: project.id,
      from: range.from.toInstant().epochMilliseconds,
      to: range.to.toInstant().epochMilliseconds,
      status,
    },
  });

  const errors = (await result.json<ClickHouseProjectErrorListItem[]>()).map((error) => ({
    ...error,
    occurrences: Number(error.occurrences),
    lastSeen: Number(error.lastSeen),
    firstSeen: Number(error.firstSeen),
  }));

  return errors;
}

async function updateStatus({
  project,
  hashes,
  status,
}: {
  project: Project;
  hashes: string[];
  status: ErrorHousekeepingStatus;
}) {
  const values = hashes.map((hash) => ({
    project_id: project.id,
    hash,
    status,
    updated_at: new Date().valueOf(),
  }));

  await clickhouse.insert({
    table: 'errors_housekeeping',
    values,
    format: 'JSONEachRow',
  });

  await queues.events.add({
    eventsNames: ['errors-changed'],
    projectId: project.id,
    ts: Date.now(),
  });
}

export async function unseenErrorsCount({ project, user }: { project: Project; user: User }) {
  const result = await clickhouse.query({
    query: `
      select count(*) as count
      from errors_housekeeping
      where project_id = {projectId: String}
      and status = 'unresolved'
      and last_updated >= {lastErrorVisitedAt: UInt64}
    `,
    format: 'JSONEachRow',
    query_params: {
      projectId: project.id,
      lastErrorVisitedAt: user.settings?.lastErrorVisitedAt ?? 0,
    },
  });

  const json = await result.json<{ count: number }[]>();

  return Number(json[0]?.count ?? 0);
}

export function archive({ project, hashes }: { project: Project; hashes: string[] }) {
  return updateStatus({ project, hashes, status: 'archived' });
}

export function resolve({ project, hashes }: { project: Project; hashes: string[] }) {
  return updateStatus({ project, hashes, status: 'resolved' });
}

export function unresolve({ project, hashes }: { project: Project; hashes: string[] }) {
  return updateStatus({ project, hashes, status: 'unresolved' });
}

export async function watch(
  project: Project,
  callback: (event: { ts: number }) => Promise<void>,
): Promise<() => void> {
  await callback({ ts: Date.now() });

  const subscription = observable
    .pipe(
      operators.project(project),
      operators.events(['errors-changed']),
      throttleTime(1000, undefined, { leading: true, trailing: true }),
    )
    .subscribe(async ([e]) => {
      await callback({ ts: e.returnvalue.ts });
    });

  return () => subscription.unsubscribe();
}

export async function findByHash({
  project,
  hash,
}: {
  project: Project;
  hash: string;
}): Promise<ProjectErrorWithStacktrace | null> {
  const result = await clickhouse.query({
    query: `
      select
        sum(occurrences) as occurrences,
        hash,
        any(kind) as kind,
        any(name) as name,
        any(message) as message,
        any(stacktrace) as stacktrace,
        any(errors_housekeeping.status) as status,
        minMerge(first_seen) as firstSeen,
        maxMerge(last_seen) as lastSeen,
        groupUniqArrayMerge(versions) as versions,
        groupUniqArrayMerge(event_ids) as eventIds,
        groupUniqArrayMerge(route_ids) as routeIds
      from
        errors
      inner join errors_housekeeping 
        on errors_housekeeping.project_id = errors.project_id
        and errors_housekeeping.hash = errors.hash
      where
        hash = {hash: String}
        and project_id = {projectId: String}
      group by
        hash;
    `,
    query_params: {
      projectId: project.id,
      hash,
    },
    format: 'JSONEachRow',
  });

  const error = (await result.json<ClickHouseProjectError[]>()).map((e) => ({
    ...e,
    occurrences: Number(e.occurrences),
    lastSeen: Number(e.lastSeen),
    firstSeen: Number(e.firstSeen),
  }))[0];

  if (!error) return null;

  const version = error.versions.at(-1);

  invariant(version, 'version should be defined');

  return error;
}
