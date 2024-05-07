import { projects, webVitals } from '@metronome/db';
import { defer, LoaderFunctionArgs } from '@remix-run/node';
import { invariant } from 'ts-invariant';

import { Breadcrumb, Heading, NotificationsOutlet } from '#app/components';
import { Filters, filters } from '#app/filters';
import { handle } from '#app/handlers/handle';
import { notFound } from '#app/responses';

import { WebVitalsByRouteSection } from './components/WebVitalsByRouteSection';
import { WebVitalsSection } from './components/WebVitalsSection';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { teamSlug = '', projectSlug = '' } = params;

  invariant(teamSlug, 'teamSlug should be defined');
  invariant(projectSlug, 'projectSlug should be defined');

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

  const webVitalsOverview = webVitals.overview({
    project,
    range,
    interval,
  });

  const webVitalsBreakdownByRoute = webVitals.breakdownByRoute({
    project,
    range,
    interval,
  });

  return defer({
    webVitalsOverview,
    webVitalsBreakdownByRoute,
  });
}

export default function Component() {
  return (
    <div className="w-full flex-grow h-full">
      <Breadcrumb>Web Vitals</Breadcrumb>
      <div className="mx-auto w-full rounded-lg">
        <NotificationsOutlet />
        <Heading
          title="Web Vitals"
          description="User experience interacting with your app."
          separatorClassName="md:mb-4"
        />
      </div>
      <div className="pb-2">
        <Filters filters={[filters.dateRange(), filters.interval()]} />
      </div>
      <div className="pt-4 px-4">
        <WebVitalsSection />
        <WebVitalsByRouteSection />
      </div>
    </div>
  );
}
