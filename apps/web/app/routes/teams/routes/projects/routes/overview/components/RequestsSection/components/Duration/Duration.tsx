import { requests } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { formatDuration } from '#app/utils';

import { Metric } from '../../../../../../components/Metric';
import { useIsNavigatingOverview } from '../../../../hooks';

export const Duration: FunctionComponent = () => {
  const { requestsOverview } = useLoaderData() as {
    requestsOverview?: ReturnType<typeof requests.overview>;
  };

  const { requestsOverview: requestsOverviewEvent } = useEventData() as {
    requestsOverview?: Awaited<ReturnType<typeof requests.overview>>;
  };

  invariant(requestsOverview, 'requestOverview was not found in loader data');

  const title = 'Median Duration';

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) {
    return <Metric.Skeleton title={title} compact />;
  }

  return (
    <Suspense fallback={<Metric.Skeleton title={title} compact />}>
      <Await resolve={requestsOverview} errorElement={<Metric.Error title={title} compact />}>
        {(resolvedRequestsOverview) => {
          // prettier-ignore
          const value = formatDuration(requestsOverviewEvent?.duration?.p50 ?? resolvedRequestsOverview.duration?.p50, 'ns');
          return <Metric title={title} value={value} compact />;
        }}
      </Await>
    </Suspense>
  );
};
