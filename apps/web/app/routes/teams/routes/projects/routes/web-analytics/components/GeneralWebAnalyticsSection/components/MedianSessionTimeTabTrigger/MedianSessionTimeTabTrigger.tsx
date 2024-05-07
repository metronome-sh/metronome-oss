import { sessions } from '@metronome/db';
import * as Tabs from '@radix-ui/react-tabs';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent } from 'react';
import { Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { Metric } from '#app/routes/teams/routes/projects/components/Metric';
import { formatTime } from '#app/utils/formatTime';

import { useIsNavigatingWebAnalytics } from '../../../../hooks';

export const MedianSessionTimeTabTrigger: FunctionComponent = () => {
  const { sessionsOverview } = useLoaderData() as {
    sessionsOverview?: ReturnType<typeof sessions.overview>;
  };

  const { sessionsOverview: sessionsOverviewEvent } = useEventData() as {
    sessionsOverview?: Awaited<ReturnType<typeof sessions.overview>>;
  };

  invariant(sessionsOverview, 'sessionsOverview was not found in loader data');

  const title = 'Median session time';

  const isNavigating = useIsNavigatingWebAnalytics();

  if (isNavigating) return <Metric.Skeleton title={title} compact />;

  return (
    <Suspense fallback={<Metric.Skeleton title={title} compact />}>
      <Await resolve={sessionsOverview} errorElement={<Metric.Error title={title} compact />}>
        {(resolvedSessionsOverview) => {
          const value =
            sessionsOverviewEvent?.duration?.p50 ?? resolvedSessionsOverview.duration.p50 ?? 0;

          return (
            <Tabs.Trigger value="median-session-time" asChild>
              <Metric
                compact
                title={title}
                value={formatTime(value)}
                containerClassName="relative group cursor-pointer"
              >
                <div className="absolute inset-y-1 left-1 w-1 rounded-full bg-muted group-[[data-state=active]]:bg-amber-500" />
              </Metric>
            </Tabs.Trigger>
          );
        }}
      </Await>
    </Suspense>
  );
};
