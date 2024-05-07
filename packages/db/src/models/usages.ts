import { Temporal } from '@js-temporal/polyfill';
import { and, between, eq, sql } from 'drizzle-orm';

import { db } from '../db';
import { getUsagesAggregatedView, usages } from '../schema';
import { NewUsage, Project, Usage } from '../types';
import { observable, operators, throttleTime } from '../utils/events';

export async function insert(newUsage: NewUsage): Promise<Usage> {
  const [usage] = await db({ write: true })
    .insert(usages)
    .values({ ...newUsage })
    .returning();

  return usage;
}

export async function projectUsage({
  project,
  range: { from, to },
}: {
  project: Project;
  range: {
    from: Temporal.ZonedDateTime;
    to: Temporal.ZonedDateTime;
  };
}) {
  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const usages = getUsagesAggregatedView({ interval: 'day' });

  const [result = { usage: 0n }] = await db()
    .select({
      usage: sql<bigint>`sum(${usages.events})`,
    })
    .from(usages)
    .where(and(between(usages.timestamp, fromDate, toDate), eq(usages.projectId, project.id)))
    .groupBy(usages.projectId);

  return result.usage.toString();
}

export function watch(
  { project }: { project: Project },
  callback: (event: { ts: number }) => Promise<void>,
): () => void {
  callback({ ts: Date.now() });

  const subscription = observable
    .pipe(
      operators.project(project),
      operators.events(['usage']),
      throttleTime(1000, undefined, { leading: true, trailing: true }),
    )
    .subscribe(([e]) => {
      callback({ ts: e.returnvalue.ts });
    });

  return () => subscription.unsubscribe();
}

export async function teamUsage({
  teamId,
  range: { from, to },
}: {
  teamId: string;
  range: {
    from: Temporal.ZonedDateTime;
    to: Temporal.ZonedDateTime;
  };
}) {
  const fromDate = new Date(from.toInstant().epochMilliseconds);
  const toDate = new Date(to.toInstant().epochMilliseconds);

  const usages = getUsagesAggregatedView({ interval: 'day' });

  const [result = { usage: 0n }] = await db()
    .select({
      usage: sql<bigint>`sum(${usages.events})`,
    })
    .from(usages)
    .where(and(between(usages.timestamp, fromDate, toDate), eq(usages.teamId, teamId)))
    .groupBy(usages.teamId);

  return result.usage.toString();
}
