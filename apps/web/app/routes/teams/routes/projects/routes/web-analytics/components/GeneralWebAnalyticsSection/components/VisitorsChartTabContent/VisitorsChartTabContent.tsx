import { sessions } from '@metronome/db';
import * as Tabs from '@radix-ui/react-tabs';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { BarStackChart } from '#app/components/BarStackChart';
import { useEventData } from '#app/hooks/useEventData';

import { useIsNavigatingWebAnalytics } from '../../../../hooks';

export const VisitorsChartTabContent: FunctionComponent = () => {
  const { overviewSeries } = useLoaderData() as {
    overviewSeries?: ReturnType<typeof sessions.overviewSeries>;
  };

  const { overviewSeries: overviewSeriesEvent } = useEventData() as {
    overviewSeries?: Awaited<ReturnType<typeof sessions.overviewSeries>>;
  };

  invariant(overviewSeries, 'overviewSeries was not found in loader data');

  const isNavigating = useIsNavigatingWebAnalytics();

  return (
    <Tabs.Content value="visitors" asChild>
      {isNavigating ? (
        <BarStackChart.Skeleton />
      ) : (
        <Suspense fallback={<BarStackChart.Skeleton />}>
          <Await resolve={overviewSeries} errorElement={<BarStackChart.Error />}>
            {(resolvedOverviewSeries) => {
              const value = overviewSeriesEvent?.series ?? resolvedOverviewSeries.series;

              const series = value.map(({ timestamp, uniqueUserIds }) => ({
                timestamp,
                uniqueUserIds,
              }));

              return (
                <BarStackChart
                  // TODO - fix this
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data={series as any}
                  colors={['#0d9488']}
                  labels={{ uniqueUserIds: 'Visitors' }}
                />
              );
            }}
          </Await>
        </Suspense>
      )}
    </Tabs.Content>
  );
};
