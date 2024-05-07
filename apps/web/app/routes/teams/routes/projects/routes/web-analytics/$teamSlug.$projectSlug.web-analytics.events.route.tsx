import { pageviews, projects, sessions } from '@metronome/db';
import { type LoaderFunctionArgs } from '@remix-run/node';

import { filters } from '#app/filters';
import { handle } from '#app/handlers/handle';
import { notFound, stream } from '#app/responses';
import { isRangeWithinToday } from '#app/utils';

import { type loader as webAnalyticsLoader } from './$teamSlug.$projectSlug.web-analytics.route';

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

  return stream<typeof webAnalyticsLoader>(
    '$teamSlug.$projectSlug.web-analytics',
    request,
    async (send) => {
      if (!isRangeWithinToday(range)) {
        // TODO - be able to return void here
        return () => {};
      }

      const cleanupSessionsWatch = sessions.watch(project, async ({ ts }) => {
        const [
          visitorsRightNow,
          sessionsOverview,
          bounceRate,
          bounceRateSeries,
          overviewSeries,
          locationsByCountry,
          locationsByCity,
          devicesByBrowser,
          devicesByOs,
        ] = await Promise.all([
          sessions.visitorsRightNow(project),
          sessions.overview({ project, range, interval }),
          sessions.bounceRate({ project, range, interval }),
          sessions.bounceRateSeries({ project, range, interval }),
          sessions.overviewSeries({ project, range, interval }),
          sessions.countries({ project, range, interval }),
          sessions.cities({ project, range, interval }),
          sessions.devicesByBrowser({ project, range, interval }),
          sessions.devicesByOs({ project, range, interval }),
        ]);

        send(
          {
            visitorsRightNow,
            sessionsOverview,
            bounceRate,
            bounceRateSeries,
            overviewSeries,
            locationsByCountry,
            locationsByCity,
            devicesByBrowser,
            devicesByOs,
          },
          ts,
        );
      });

      const cleanupPageviewsWatch = pageviews.watch(project, async ({ ts }) => {
        const [pageviewsOverview, routesByRoutePath, routesByUrlPath, referrers] =
          await Promise.all([
            pageviews.overview({ project, range, interval }),
            pageviews.routesByRoutePath({ project, range, interval }),
            pageviews.routesByUrlPath({ project, range, interval }),
            pageviews.referrers({ project, range, interval }),
          ]);

        send({ pageviewsOverview, routesByRoutePath, routesByUrlPath, referrers }, ts);
      });
      return async function cleanup() {
        cleanupSessionsWatch();
        cleanupPageviewsWatch();
      };
    },
  );
}
