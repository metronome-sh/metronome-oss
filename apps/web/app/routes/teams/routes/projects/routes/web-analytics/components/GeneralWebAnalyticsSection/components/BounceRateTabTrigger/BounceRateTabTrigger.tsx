import { sessions } from '@metronome/db';
import * as Tabs from '@radix-ui/react-tabs';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent } from 'react';
import { Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { Metric } from '#app/routes/teams/routes/projects/components/Metric';

import { useIsNavigatingWebAnalytics } from '../../../../hooks';

export const BounceRateTabTrigger: FunctionComponent = () => {
  const { bounceRate } = useLoaderData() as {
    bounceRate?: ReturnType<typeof sessions.bounceRate>;
  };

  const { bounceRate: bounceRateEvent } = useEventData() as {
    bounceRate?: Awaited<ReturnType<typeof sessions.bounceRate>>;
  };

  invariant(bounceRate, 'bounceRate was not found in loader data');

  const title = 'Bounce rate';

  const isNavigating = useIsNavigatingWebAnalytics();

  if (isNavigating) return <Metric.Skeleton title={title} compact />;

  return (
    <Suspense fallback={<Metric.Skeleton title={title} compact />}>
      <Await resolve={bounceRate} errorElement={<Metric.Error title={title} compact />}>
        {(resolvedBounceRate) => {
          const value = bounceRateEvent ?? resolvedBounceRate;

          return (
            <Tabs.Trigger value="bounce-rate" asChild>
              <Metric
                compact
                title={title}
                value={value !== null ? `${Math.round(value)}%` : '―'}
                containerClassName="relative group cursor-pointer"
              >
                <div className="absolute inset-y-1 left-1 w-1 rounded-full bg-muted group-[[data-state=active]]:bg-rose-500" />
              </Metric>
            </Tabs.Trigger>
          );
        }}
      </Await>
    </Suspense>
  );
};
