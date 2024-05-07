import { loaders } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { formatNumber } from '#app/utils';

import { Metric } from '../../../../../../components/Metric';
import { useIsNavigatingOverview } from '../../../../hooks/useIsNavigatingOverview';

export const Invocations: FunctionComponent = () => {
  const { loadersOverview } = useLoaderData() as {
    loadersOverview?: ReturnType<typeof loaders.overview>;
  };

  const { loadersOverview: loadersOverviewEvent } = useEventData() as {
    loadersOverview?: Awaited<ReturnType<typeof loaders.overview>>;
  };

  invariant(loadersOverview, 'requestOverview was not found in loader data');

  const title = 'Invocations';

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) {
    return <Metric.Skeleton title={title} compact />;
  }

  return (
    <Suspense fallback={<Metric.Skeleton title={title} compact />}>
      <Await resolve={loadersOverview} errorElement={<Metric.Error title={title} compact />}>
        {(resolvedLoadersOverview) => {
          return (
            <Metric
              title={title}
              value={formatNumber(
                loadersOverviewEvent?.count ?? resolvedLoadersOverview.count,
                '0',
              )}
              compact
            />
          );
        }}
      </Await>
    </Suspense>
  );
};
