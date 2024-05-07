import { pageviews } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { Metric } from '#app/routes/teams/routes/projects/components';
import { formatNumber } from '#app/utils';

import { useIsNavigatingOverview } from '../../../../hooks';

export const TotalPageviews: FunctionComponent = () => {
  const { pageviewsOverview } = useLoaderData() as {
    pageviewsOverview?: ReturnType<typeof pageviews.overview>;
  };

  const { pageviewsOverview: pageviewsOverviewEvent } = useEventData() as {
    pageviewsOverview?: Awaited<ReturnType<typeof pageviews.overview>>;
  };

  invariant(pageviewsOverview, 'requestOverview was not found in loader data');

  const isNavigating = useIsNavigatingOverview();

  const title = 'Views';

  if (isNavigating) {
    return <Metric.Skeleton title={title} />;
  }

  return (
    <Suspense fallback={<Metric.Skeleton title={title} />}>
      <Await resolve={pageviewsOverview} errorElement={<Metric.Error title={title} />}>
        {(resolvedPageviewsOverview) => {
          const value =
            pageviewsOverviewEvent?.pageviewCount ?? resolvedPageviewsOverview.pageviewCount;

          return <Metric title={title} value={formatNumber(value, '0')} />;
        }}
      </Await>
    </Suspense>
  );
};
