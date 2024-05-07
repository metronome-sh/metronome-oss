import { actions } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent } from 'react';
import { Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { BarStackChart } from '#app/components';
import { useEventData } from '#app/hooks/useEventData';

import { useIsNavigatingOverview } from '../../../../hooks';

export const Chart: FunctionComponent = () => {
  const { actionsOverviewSeries } = useLoaderData() as {
    actionsOverviewSeries?: ReturnType<typeof actions.overviewSeries>;
  };

  const { actionsOverviewSeries: actionsOverviewSeriesEvent } = useEventData() as {
    actionsOverviewSeries?: Awaited<ReturnType<typeof actions.overviewSeries>>;
  };

  invariant(actionsOverviewSeries, 'requestOverview was not found in loader data');

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) {
    return <BarStackChart.Skeleton />;
  }

  return (
    <Suspense fallback={<BarStackChart.Skeleton />}>
      <Await resolve={actionsOverviewSeries} errorElement={<BarStackChart.Error />}>
        {(resolvedActionsSeries) => {
          const series = (actionsOverviewSeriesEvent?.series ?? resolvedActionsSeries.series).map(
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
              colors={['#8b5cf6', '#f5bf4f']}
              labels={{ okCount: 'Invocations', erroredCount: 'Errors' }}
            />
          );
        }}
      </Await>
    </Suspense>
  );
};
