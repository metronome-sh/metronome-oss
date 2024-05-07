import {
  actions,
  loaders,
  pageviews,
  projects,
  requests,
  sessions,
  webVitals,
} from '@metronome/db';
import { defer, LoaderFunctionArgs } from '@remix-run/node';
import { invariant } from 'ts-invariant';

import { Container, Heading } from '#app/components';
import { Filters, filters } from '#app/filters';
import { handle } from '#app/handlers/handle';
import { notFound } from '#app/responses';

import { ActionsSection } from '../teams/routes/projects/routes/overview/components/ActionsSection';
import { LoadersSection } from '../teams/routes/projects/routes/overview/components/LoadersSection';
import { RequestsSection } from '../teams/routes/projects/routes/overview/components/RequestsSection';
import { WebAnalyticsSection } from '../teams/routes/projects/routes/overview/components/WebAnalyticsSection';
import { WebVitalsSection } from '../teams/routes/projects/routes/overview/components/WebVitalsSection';
import { SharedHeader } from './components/SharedHeader';
import { useSharedProjectLoaderData } from './hooks/useSharedProjectLoaderData';

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

  return defer({
    project,
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
  });
}

export default function SharedProjectId() {
  const { project } = useSharedProjectLoaderData();

  return (
    <Container>
      <SharedHeader />
      <div className="mx-auto w-full h-full flex-grow flex flex-col border-t">
        <div className="mx-auto w-full h-full max-w-screen-xl  px-4">
          <Heading
            title={project.name}
            description={project.url ? project.url : `Shared view of ${project.name}`}
            separatorClassName="md:mb-4"
          />
          <div className="pb-2">
            <Filters filters={[filters.dateRange(), filters.interval()]} />
          </div>
          <div className="px-2 space-y-4">
            <WebAnalyticsSection />
            <WebVitalsSection />
            <RequestsSection />
            <LoadersSection />
            <ActionsSection />
          </div>
        </div>
      </div>
    </Container>
  );
}
