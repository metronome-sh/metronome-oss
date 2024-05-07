import { sessions } from '@metronome/db';
import * as Tabs from '@radix-ui/react-tabs';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { BarStackChart } from '#app/components/BarStackChart';
import { useEventData } from '#app/hooks/useEventData';

import { useIsNavigatingWebAnalytics } from '../../../../hooks';

export const ViewsTabContent: FunctionComponent = () => {
  const { overviewSeries } = useLoaderData() as {
    overviewSeries?: ReturnType<typeof sessions.overviewSeries>;
  };

  const { overviewSeries: overviewSeriesEvent } = useEventData() as {
    overviewSeries?: Awaited<ReturnType<typeof sessions.overviewSeries>>;
  };

  invariant(overviewSeries, 'overviewSeries was not found in loader data');

  const isNavigating = useIsNavigatingWebAnalytics();

  return (
    <Tabs.Content value="views" asChild>
      {isNavigating ? (
        <BarStackChart.Skeleton />
      ) : (
        <Suspense fallback={<BarStackChart.Skeleton />}>
          <Await resolve={overviewSeries} errorElement={<BarStackChart.Error />}>
            {(resolvedOverviewSeries) => {
              const series = (overviewSeriesEvent?.series ?? resolvedOverviewSeries.series).map(
                ({ timestamp, pageviews }) => ({ timestamp, pageviews }),
              );

              return (
                <BarStackChart
                  // TODO - fix this
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data={series as any}
                  colors={['#8b5cf6']}
                  labels={{ pageviews: 'Views' }}
                />
              );
            }}
          </Await>
        </Suspense>
      )}
    </Tabs.Content>
  );
};
