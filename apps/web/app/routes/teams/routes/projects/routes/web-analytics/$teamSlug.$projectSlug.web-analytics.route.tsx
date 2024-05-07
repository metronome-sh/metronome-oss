import { pageviews, projects, sessions } from '@metronome/db';
import { defer, LoaderFunctionArgs } from '@remix-run/node';

import { Breadcrumb, Heading, NotificationsOutlet } from '#app/components';
import { Filters, filters } from '#app/filters';
import { handle } from '#app/handlers/handle';
import { notFound } from '#app/responses';

import { GeneralWebAnalyticsSection, LocationsSection } from './components';
import { DevicesSection } from './components/DevicesSection';
import { ReferrersSection } from './components/ReferrersSection';
import { RoutesSection } from './components/RoutesSection';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { teamSlug = '', projectSlug = '' } = params;

  const { auth, query } = await handle(request);

  const user = await auth.user();

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

  const visitorsRightNow = sessions.visitorsRightNow(project);

  const sessionsOverview = sessions.overview({
    project,
    range,
    interval,
  });

  const pageviewsOverview = pageviews.overview({
    project,
    range,
    interval,
  });

  const bounceRate = sessions.bounceRate({ project, range, interval });

  const bounceRateSeries = sessions.bounceRateSeries({
    project,
    range,
    interval,
  });

  const overviewSeries = sessions.overviewSeries({
    project,
    range,
    interval,
  });

  const locationsByCountry = sessions.countries({ project, range, interval });

  const locationsByCity = sessions.cities({ project, range, interval });

  const routesByRoutePath = pageviews.routesByRoutePath({
    project,
    range,
    interval,
  });

  const routesByUrlPath = pageviews.routesByUrlPath({
    project,
    range,
    interval,
  });

  const referrers = pageviews.referrers({ project, range, interval });

  const devicesByBrowser = sessions.devicesByBrowser({
    project,
    range,
    interval,
  });

  const devicesByOs = sessions.devicesByOs({ project, range, interval });

  return defer({
    visitorsRightNow,
    sessionsOverview,
    pageviewsOverview,
    bounceRate,
    bounceRateSeries,
    overviewSeries,
    locationsByCountry,
    locationsByCity,
    routesByRoutePath,
    routesByUrlPath,
    referrers,
    devicesByBrowser,
    devicesByOs,
  });
}

export default function Component() {
  return (
    <div className="w-full flex-grow h-full">
      <Breadcrumb>Web Analytics</Breadcrumb>
      <div className="mx-auto w-full rounded-lg">
        <NotificationsOutlet />
        <Heading
          title="Web Analytics"
          description="Understand client performance and user behavior."
          separatorClassName="md:mb-4"
        />
      </div>
      <div className="pb-2">
        <Filters filters={[filters.dateRange(), filters.interval()]} />
      </div>
      <div className="pt-4 px-4">
        <GeneralWebAnalyticsSection />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocationsSection />
          <RoutesSection />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReferrersSection />
          <DevicesSection />
        </div>
      </div>
    </div>
  );
}
