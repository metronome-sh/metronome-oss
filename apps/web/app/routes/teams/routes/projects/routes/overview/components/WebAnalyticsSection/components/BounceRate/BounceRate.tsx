import { sessions } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { Metric } from '#app/routes/teams/routes/projects/components';

import { useIsNavigatingOverview } from '../../../../hooks';

export const BounceRate: FunctionComponent = () => {
  const { bounceRate } = useLoaderData() as {
    bounceRate?: ReturnType<typeof sessions.bounceRate>;
  };

  const { bounceRate: bounceRateEvent } = useEventData() as {
    bounceRate?: Awaited<ReturnType<typeof sessions.bounceRate>>;
  };

  invariant(bounceRate, 'requestOverview was not found in loader data');

  const title = 'Bounce rate';

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) {
    return <Metric.Skeleton title={title} />;
  }

  return (
    <Suspense fallback={<Metric.Skeleton title={title} />}>
      <Await resolve={bounceRate} errorElement={<Metric.Error title={title} />}>
        {(resolvedBounceRate) => {
          const value = bounceRateEvent ?? resolvedBounceRate;
          return <Metric title={title} value={value !== null ? `${Math.round(value)}%` : '—'} />;
        }}
      </Await>
    </Suspense>
  );
};
