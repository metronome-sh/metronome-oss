import { loaders } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent } from 'react';
import { Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { BarStackChart } from '#app/components';
import { useEventData } from '#app/hooks/useEventData';

import { useIsNavigatingOverview } from '../../../../hooks/useIsNavigatingOverview';

export const Chart: FunctionComponent = () => {
  const { loadersOverviewSeries } = useLoaderData() as {
    loadersOverviewSeries?: ReturnType<typeof loaders.overviewSeries>;
  };

  const { loadersOverviewSeries: loadersOverviewSeriesEvent } = useEventData() as {
    loadersOverviewSeries?: Awaited<ReturnType<typeof loaders.overviewSeries>>;
  };

  invariant(loadersOverviewSeries, 'requestOverview was not found in loader data');

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) {
    return <BarStackChart.Skeleton />;
  }

  return (
    <Suspense fallback={<BarStackChart.Skeleton />}>
      <Await resolve={loadersOverviewSeries} errorElement={<BarStackChart.Error />}>
        {(resolvedLoadersSeries) => {
          const series = (loadersOverviewSeriesEvent?.series ?? resolvedLoadersSeries.series).map(
            ({ timestamp, okCount, erroredCount }) => ({
              timestamp,
              okCount,
              erroredCount,
            }),
          );

          return (
            <BarStackChart
              // TODO - fix this
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data={series as any}
              colors={['#0891b2', '#f5bf4f']}
              labels={{ okCount: 'Invocations', erroredCount: 'Errors' }}
            />
          );
        }}
      </Await>
    </Suspense>
  );
};
