import {
  actions,
  loaders,
  pageviews,
  projects,
  requests,
  sessions,
  webVitals,
} from '@metronome/db';
import { defer, type LoaderFunctionArgs } from '@remix-run/node';
import { useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';

import { Breadcrumb, Heading, NotificationsOutlet } from '#app/components';
import { Filters, filters } from '#app/filters';
import { handle } from '#app/handlers/handle';
import { notFound } from '#app/responses';

import {
  ActionsSection,
  LoadersSection,
  RequestsSection,
  WebAnalyticsSection,
  WebVitalsSection,
} from './components';
import { EmptyState } from './components/EmptyState/EmptyState';
import { useOverviewEventData, useOverviewLoaderData } from './hooks';

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

  const requestsOverview = requests.overview({
    project,
    interval,
    range,
  });

  const requestsCountSeries = requests.countSeries({
    project,
    interval,
    range,
  });

  const loadersOverview = loaders.overview({ project, range, interval });

  const loadersOverviewSeries = loaders.overviewSeries({
    project,
    range,
    interval,
  });

  const actionsOverview = actions.overview({ project, range, interval });

  const actionsOverviewSeries = actions.overviewSeries({
    project,
    range,
    interval,
  });

  const webVitalsOverview = webVitals.overview({
    project,
    range,
    interval,
  });

  const visitorsRightNow = sessions.visitorsRightNow(project);

  const sessionsOverview = sessions.overview({
    project,
    range,
    interval,
  });

  const bounceRate = sessions.bounceRate({ project, range, interval });

  const pageviewsOverview = pageviews.overview({
    project,
    range,
    interval,
  });

  const isNewProject = project.isNew;

  return defer({
    requestsOverview,
    requestsCountSeries,
    loadersOverview,
    loadersOverviewSeries,
    actionsOverview,
    actionsOverviewSeries,
    webVitalsOverview,
    visitorsRightNow,
    sessionsOverview,
    pageviewsOverview,
    bounceRate,
    isNewProject,
  });
}

export default function Component() {
  const revalidator = useRevalidator();

  const { isNewProject } = useOverviewLoaderData();
  const { isNewProject: isNewProjectFromEvent } = useOverviewEventData();

  useEffect(() => {
    if (!isNewProject) return;

    if (isNewProjectFromEvent === false && revalidator.state === 'idle') {
      revalidator.revalidate();
    }
  }, [isNewProjectFromEvent, isNewProject, revalidator]);

  if (isNewProject) {
    return (
      <>
        <NotificationsOutlet />
        <Breadcrumb>Overview</Breadcrumb>
        <EmptyState />
      </>
    );
  }

  return (
    <div className="w-full flex-grow h-full">
      <Breadcrumb>Overview</Breadcrumb>
      <NotificationsOutlet />
      <div className="mx-auto w-full rounded-lg">
        <Heading
          title="Overview"
          description={`General summary of your app`}
          separatorClassName="md:mb-4"
        />
        <div className="pb-2">
          <Filters filters={[filters.dateRange(), filters.interval()]} />
        </div>
        <div className="px-2 space-y-4">
          <WebAnalyticsSection />
          <WebVitalsSection />
          {/* <RequestsSection /> */}
          <LoadersSection />
          <ActionsSection />
        </div>
      </div>
    </div>
  );
}
