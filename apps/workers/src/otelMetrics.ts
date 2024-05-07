import { insertMetrics, pageviews, projects, webVitals } from '@metronome/db';
import { queues } from '@metronome/queues';
import { cache } from '@metronome/cache';

export async function otelMetrics(job: typeof queues.otelMetrics.$inferJob) {
  const {
    data: { apiKey, metrics },
  } = job;

  if (!apiKey) {
    return 'apiKey should be defined';
  }

  if (!Array.isArray(metrics)) {
    return 'metrics should be an array';
  }

  // TODO this should be managed by the db package
  const project = await cache.remember(
    ['project', apiKey],
    () => projects.findByApiKey({ apiKey }),
    10,
  );

  if (!project) {
    return `No project found for key ${apiKey}`;
  }

  // Transforming metrics to legacy events
  const transformed = metrics
    .map((metric) => {
      // pageview
      if (metric.name === 'pageview') {
        return pageviews.convertMetricToPageviewEvent(metric);
      }

      if (['LCP', 'FCP', 'FID', 'CLS', 'TTFB', 'INP'].includes(metric.name)) {
        return webVitals.convertMetricToWebVitalEvent(metric);
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

  return `processed [${eventsNames.join(', ')}] events for project ${project.id}`;
}
