import { insertMetrics, Project, projects } from '@metronome/db';
import { queues } from '@metronome/queues';

const projectsCache = new Map<string, Project>();

export async function metrics(job: typeof queues.metrics.$inferJob) {
  const {
    data: { apiKey, data },
  } = job;

  // prettier-ignore
  const project = projectsCache.get(apiKey) || (await projects.findByApiKey({ apiKey }));

  if (!project) {
    return `No project found for key ${apiKey}`;
  }

  projectsCache.set(apiKey, project);

  let eventsNames: string[] = [];

  try {
    eventsNames = await insertMetrics({ project, unverifiedEvents: data });
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
    projectsCache.delete(apiKey);

    const updatedProject = await projects.update({
      id: project.id,
      attributes: { isNew: false },
    });

    projectsCache.set(apiKey, updatedProject);

    await queues.events.add({
      projectId: project.id,
      eventsNames: ['first-event'],
      ts: Date.now(),
    });
  }

  return `processed [${eventsNames.join(', ')}] events for project ${project.id}`;
}
