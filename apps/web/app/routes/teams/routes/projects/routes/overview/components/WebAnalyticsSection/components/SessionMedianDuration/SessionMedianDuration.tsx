import { sessions } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent } from 'react';
import { Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { Metric } from '#app/routes/teams/routes/projects/components';
import { formatTime } from '#app/utils';

import { useIsNavigatingOverview } from '../../../../hooks';

export const SessionMedianDuration: FunctionComponent = () => {
  const { sessionsOverview } = useLoaderData() as {
    sessionsOverview?: ReturnType<typeof sessions.overview>;
  };

  const { sessionsOverview: sessionsOverviewEvent } = useEventData() as {
    sessionsOverview?: Awaited<ReturnType<typeof sessions.overview>>;
  };

  invariant(sessionsOverview, 'requestOverview was not found in loader data');

  const title = 'Median session time';

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) {
    return <Metric.Skeleton title={title} />;
  }

  return (
    <Suspense fallback={<Metric.Skeleton title={title} />}>
      <Await resolve={sessionsOverview} errorElement={<Metric.Error title={title} />}>
        {(resolvedSessionsOverview) => {
          const value =
            sessionsOverviewEvent?.duration.p50 ?? resolvedSessionsOverview.duration.p50;
          return <Metric title={title} value={formatTime(value)} />;
        }}
      </Await>
    </Suspense>
  );
};
