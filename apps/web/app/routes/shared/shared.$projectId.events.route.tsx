import {
  actions,
  loaders,
  pageviews,
  projects,
  requests,
  sessions,
  webVitals,
} from '@metronome/db';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { invariant } from 'ts-invariant';

import { filters } from '#app/filters';
import { handle } from '#app/handlers/handle';
import { notFound, stream } from '#app/responses';
import { isRangeWithinToday } from '#app/utils';

import { type loader as sharedProjectLoader } from './shared.$projectId.route';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { projectId = '' } = params;

  invariant(projectId, 'projectId should be defined');

  const { query } = await handle(request);

  const project = await projects.findPublicProjectById(projectId);

  if (!project) throw notFound();

  const { interval, range } = await query.filters({
    interval: filters.interval(),
    range: filters.dateRange(),
  });

  return stream<typeof sharedProjectLoader>('shared.$projectId', request, async (send) => {
    if (!isRangeWithinToday(range)) {
      // TODO - be able to return void here
      return () => {};
    }

    const cleanupRequestsWatch = await requests.watch(project, async ({ ts }) => {
      const [requestsOverview, requestsCountSeries] = await Promise.all([
        requests.overview({ project, range, interval }),
        requests.countSeries({ project, range, interval }),
      ]);

      send({ requestsOverview, requestsCountSeries }, ts);
    });

    const cleanupLoadersWatch = await loaders.watch(project, async ({ ts }) => {
      const [loadersOverview, loadersOverviewSeries] = await Promise.all([
        loaders.overview({ project, range, interval }),
        loaders.overviewSeries({ project, range, interval }),
      ]);

      send({ loadersOverview, loadersOverviewSeries }, ts);
    });

    const cleanupActionsWatch = await actions.watch(project, async ({ ts }) => {
      const [actionsOverview, actionsOverviewSeries] = await Promise.all([
        actions.overview({ project, range, interval }),
        actions.overviewSeries({ project, range, interval }),
      ]);

      send({ actionsOverview, actionsOverviewSeries }, ts);
    });

    const cleanupWebVitals = await webVitals.watch(project, async ({ ts }) => {
      const webVitalsOverview = await webVitals.overview({
        project,
        range,
        interval,
      });
      send({ webVitalsOverview }, ts);
    });

    const cleanupSessionsWatch = await sessions.watch(project, async ({ ts }) => {
      const [visitorsRightNow, sessionsOverview, bounceRate] = await Promise.all([
        sessions.visitorsRightNow(project),
        sessions.overview({
          project,
          range,
          interval,
        }),
        sessions.bounceRate({ project, range, interval }),
      ]);

      send({ visitorsRightNow, sessionsOverview, bounceRate }, ts);
    });

    const cleanupPageviewsWatch = await pageviews.watch(project, async ({ ts }) => {
      const pageviewsOverview = await pageviews.overview({
        project,
        range,
        interval,
      });
      send({ pageviewsOverview }, ts);
    });

    return async function cleanup() {
      cleanupRequestsWatch();
      cleanupLoadersWatch();
      cleanupActionsWatch();
      cleanupWebVitals();
      cleanupSessionsWatch();
      cleanupPageviewsWatch();
    };
  });
}
