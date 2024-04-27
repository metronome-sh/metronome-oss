import { cache } from '@metronome/cache';
import { actions, insertMetrics, loaders, projects, spans, teams } from '@metronome/db';
import { queues } from '@metronome/queues';
import { invariant } from 'ts-invariant';

export async function otelSpans(job: typeof queues.otelSpans.$inferJob) {
  const {
    data: { apiKey, spans: data },
  } = job;

  if (!spans.valid(data)) {
    return `Invalid spans data: ${JSON.stringify(data)}`;
  }

  const project = await cache.remember(
    [apiKey, 'project'],
    async () => projects.findByApiKey({ apiKey }),
    60,
  );

  if (!project) {
    return `No project found for key ${apiKey}`;
  }

  const team = await cache.remember(
    [apiKey, 'team'],
    async () => teams.findFirst({ id: project.teamId }),
    60,
  );

  invariant(team, `Team ${project.teamId} not found`);

  await spans.create({ spanOrSpans: data, project });

  const transformed = (Array.isArray(data) ? data : [data])
    .map((span) => {
      if (span.name === 'loader') {
        return loaders.convertSpanToLoaderEvent(span);
      }

      if (span.name === 'action') {
        return actions.convertSpanToActionEvent(span);
      }

      return false;
    })
    .filter(Boolean) as unknown[];

  let eventsNames: string[] = [];

  try {
    eventsNames = await insertMetrics({ project, unverifiedEvents: transformed });
  } catch (error) {
    console.log(error);
    throw error;
  }

  if (eventsNames.length > 0) {
    await queues.events.add({
      projectId: project.id,
      eventsNames: [...eventsNames, 'usage'],
      ts: Date.now(),
    });
  }

  if (project.isNew) {
    await cache.forget(['project', apiKey]);

    const updatedProject = await projects.update({
      id: project.id,
      attributes: { isNew: false },
    });

    await cache.set(['project', apiKey], () => updatedProject, 10);

    await queues.events.add({
      projectId: project.id,
      eventsNames: ['first-event'],
      ts: Date.now(),
    });
  }

  return `processed spans for project ${project.id}`;
}
