import * as actions from './models/actions';
import * as loaders from './models/loaders';
import * as pageviews from './models/pageviews';
import * as projects from './models/projects';
import * as requests from './models/requests';
import * as usages from './models/usages';
import * as webVitals from './models/webVitals/webVitals';
import { type Project } from './types';

export async function insertMetrics({
  project,
  unverifiedEvents,
}: {
  project: Project;
  unverifiedEvents: unknown;
}) {
  if (!Array.isArray(unverifiedEvents)) {
    // prettier-ignore
    throw new Error('Failed to process data: \n' + 'unverifiedEvents is not an array');
  }

  const eventNames = new Set<string>();

  const settled = await Promise.allSettled(
    unverifiedEvents.map(async (event) => {
      if (pageviews.isPageviewEvent(event)) {
        eventNames.add(event.name);
        return pageviews.insert(project, event);
      }

      if (requests.isRequestEvent(event)) {
        eventNames.add(event.name);
        if (project.clientVersion !== event.details.version) {
          await projects.update({
            id: project.id,
            attributes: { clientVersion: event.details.version },
          });

          eventNames.add('project-client-updated');
        }
        return requests.insert(project, event);
      }

      if (loaders.isLoaderEvent(event)) {
        eventNames.add(event.name);

        if (event.details.adapter === 'vite' && !project.isUsingVite) {
          await projects.update({
            id: project.id,
            attributes: { isUsingVite: true },
          });

          eventNames.add('project-client-updated');
        }

        return loaders.insert(project, event);
      }

      if (actions.isActionEvent(event)) {
        eventNames.add(event.name);
        return actions.insert(project, event);
      }

      if (webVitals.isWebVitalEvent(event)) {
        eventNames.add(event.name);
        return webVitals.insert(project, event);
      }

      console.warn(`Failed to process data: unknown event type ${event.name}`);
    }),
  );

  const failures = settled.filter((s) => s.status === 'rejected');

  await usages.insert({
    projectId: project.id,
    teamId: project.teamId,
    events: BigInt(unverifiedEvents.length),
  });

  if (failures.length) {
    // prettier-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error('Failed to process data: \n' + failures.map((r) => (r as any).reason).join('\n'));
  }

  return [...eventNames];
}
