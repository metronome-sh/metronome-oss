import { requests } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent } from 'react';
import { Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { BarStackChart } from '#app/components';
import { useEventData } from '#app/hooks/useEventData';

import { useIsNavigatingOverview } from '../../../../hooks/useIsNavigatingOverview';

export const Chart: FunctionComponent = () => {
  const { requestsCountSeries } = useLoaderData() as {
    requestsCountSeries?: ReturnType<typeof requests.countSeries>;
  };

  const { requestsCountSeries: requestsCountSeriesEvent } = useEventData() as {
    requestsCountSeries?: Awaited<ReturnType<typeof requests.countSeries>>;
  };

  invariant(requestsCountSeries, 'requestOverview was not found in loader data');

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) {
    return <BarStackChart.Skeleton />;
  }

  return (
    <Suspense fallback={<BarStackChart.Skeleton />}>
      <Await resolve={requestsCountSeries} errorElement={<BarStackChart.Error />}>
        {(resolvedRequestsCountSeries) => {
          const data = requestsCountSeriesEvent?.series ?? resolvedRequestsCountSeries.series;

          return (
            <BarStackChart
              // TODO - fix this
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={data as any}
              colors={['#0d9488', '#14b8a6']}
              labels={{
                dataCount: 'Data requests',
                documentCount: 'Document requests',
              }}
            />
          );
        }}
      </Await>
    </Suspense>
  );
};
