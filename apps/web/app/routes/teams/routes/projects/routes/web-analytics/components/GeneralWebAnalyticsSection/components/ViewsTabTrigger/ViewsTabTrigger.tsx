import { pageviews } from '@metronome/db';
import * as Tabs from '@radix-ui/react-tabs';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent } from 'react';
import { Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { Metric } from '#app/routes/teams/routes/projects/components/Metric';
import { formatNumber } from '#app/utils';

import { useIsNavigatingWebAnalytics } from '../../../../hooks';

export const ViewsTabTrigger: FunctionComponent = () => {
  const { pageviewsOverview } = useLoaderData() as {
    pageviewsOverview?: ReturnType<typeof pageviews.overview>;
  };

  const { pageviewsOverview: pageviewsOverviewEvent } = useEventData() as {
    pageviewsOverview?: Awaited<ReturnType<typeof pageviews.overview>>;
  };

  invariant(pageviewsOverview, 'pageviewsOverview was not found in loader data');

  const title = 'Views';

  const isNavigating = useIsNavigatingWebAnalytics();

  if (isNavigating) return <Metric.Skeleton title={title} compact />;

  return (
    <Suspense fallback={<Metric.Skeleton title={title} compact />}>
      <Await resolve={pageviewsOverview} errorElement={<Metric.Error title={title} compact />}>
        {(resolvedPageviewsOverview) => {
          const value =
            pageviewsOverviewEvent?.pageviewCount ?? resolvedPageviewsOverview.pageviewCount ?? 0;

          return (
            <Tabs.Trigger value="views" asChild>
              <Metric
                compact
                title={title}
                value={formatNumber(value, '0')}
                containerClassName="relative group cursor-pointer"
                rawValue={`${value.toLocaleString()} views`}
              >
                <div className="absolute inset-y-1 left-1 w-1 rounded-full bg-muted group-[[data-state=active]]:bg-violet-500" />
              </Metric>
            </Tabs.Trigger>
          );
        }}
      </Await>
    </Suspense>
  );
};
