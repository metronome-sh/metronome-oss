import { requests } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { formatNumber } from '#app/utils';

import { Metric } from '../../../../../../components/Metric';
import { useIsNavigatingOverview } from '../../../../hooks/useIsNavigatingOverview';

export const DataRequests: FunctionComponent = () => {
  const { requestsOverview } = useLoaderData() as {
    requestsOverview?: ReturnType<typeof requests.overview>;
  };

  const { requestsOverview: requestsOverviewEvent } = useEventData() as {
    requestsOverview?: Awaited<ReturnType<typeof requests.overview>>;
  };

  invariant(requestsOverview, 'requestOverview was not found in loader data');

  const title = 'Data requests';

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) {
    return <Metric.Skeleton title={title} compact />;
  }

  return (
    <Suspense fallback={<Metric.Skeleton title={title} compact />}>
      <Await resolve={requestsOverview} errorElement={<Metric.Error title={title} compact />}>
        {(resolvedRequestsOverview) => {
          // prettier-ignore
          const value = requestsOverviewEvent?.dataCount ?? resolvedRequestsOverview.dataCount;

          return (
            <Metric
              title={title}
              value={formatNumber(value, '0')}
              rawValue={
                value && value > 1000 ? `${value?.toLocaleString()} total requests` : undefined
              }
              compact
            />
          );
        }}
      </Await>
    </Suspense>
  );
};
