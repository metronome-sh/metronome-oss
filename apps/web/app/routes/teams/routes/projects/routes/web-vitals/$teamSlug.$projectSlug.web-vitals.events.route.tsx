import { projects, webVitals } from '@metronome/db';
import { type LoaderFunctionArgs } from '@remix-run/node';

import { filters } from '#app/filters';
import { handle } from '#app/handlers/handle';
import { notFound, stream } from '#app/responses';
import { isRangeWithinToday } from '#app/utils';

import { type loader as overviewLoader } from './$teamSlug.$projectSlug.web-vitals.route';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { auth, query } = await handle(request);

  const user = await auth.user();

  const { teamSlug = '', projectSlug = '' } = params;

  const project = await projects.findBySlugs({
    teamSlug,
    projectSlug,
    userId: user.id,
  });

  if (!project) throw notFound();

  const { interval, range } = await query.filters({
    interval: filters.interval(),
    range: filters.dateRange(),
  });

  return stream<typeof overviewLoader>(
    '$teamSlug.$projectSlug.web-vitals',
    request,
    async (send) => {
      if (!isRangeWithinToday(range)) {
        // TODO - be able to return void here
        return () => {};
      }

      const cleanupWebVitals = await webVitals.watch(project, async ({ ts }) => {
        const webVitalsOverview = await webVitals.overview({
          project,
          range,
          interval,
        });
        send({ webVitalsOverview }, ts);
      });

      return async function cleanup() {
        cleanupWebVitals();
      };
    },
  );
}
