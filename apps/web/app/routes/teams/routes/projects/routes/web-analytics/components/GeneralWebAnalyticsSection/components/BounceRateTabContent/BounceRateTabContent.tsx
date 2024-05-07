import { sessions } from '@metronome/db';
import * as Tabs from '@radix-ui/react-tabs';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { BarStackChart } from '#app/components/BarStackChart';
import { useEventData } from '#app/hooks/useEventData';

import { useIsNavigatingWebAnalytics } from '../../../../hooks/useIsNavigatingWebAnalytics';

export const BounceRateTabContent: FunctionComponent = () => {
  const { bounceRateSeries } = useLoaderData() as {
    bounceRateSeries?: ReturnType<typeof sessions.bounceRateSeries>;
  };

  const { bounceRateSeries: bounceRateSeriesEvent } = useEventData() as {
    bounceRateSeries?: Awaited<ReturnType<typeof sessions.bounceRateSeries>>;
  };

  invariant(bounceRateSeries, 'bounceRateSeries was not found in loader data');

  const isNavigating = useIsNavigatingWebAnalytics();

  return (
    <Tabs.Content value="bounce-rate" asChild>
      {isNavigating ? (
        <BarStackChart.Skeleton />
      ) : (
        <Suspense fallback={<BarStackChart.Skeleton />}>
          <Await resolve={bounceRateSeries} errorElement={<BarStackChart.Error />}>
            {(resolvedBounceRateSeries) => {
              const series = bounceRateSeriesEvent?.series ?? resolvedBounceRateSeries.series;
              return (
                <BarStackChart
                  // TODO - fix this
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data={series as any}
                  colors={['#f43f5e']}
                  labels={{ bounceRate: 'Bounce rate' }}
                  formatValues={{
                    bounceRate: (value) => (value !== null ? `${Math.round(value)}%` : '-'),
                  }}
                />
              );
            }}
          </Await>
        </Suspense>
      )}
    </Tabs.Content>
  );
};
