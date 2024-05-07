import { actions } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { formatDuration } from '#app/utils';

import { Metric } from '../../../../../../components/Metric';
import { useIsNavigatingOverview } from '../../../../hooks';

export const Duration: FunctionComponent = () => {
  const { actionsOverview } = useLoaderData() as {
    actionsOverview?: ReturnType<typeof actions.overview>;
  };

  const { actionsOverview: actionsOverviewEvent } = useEventData() as {
    actionsOverview?: Awaited<ReturnType<typeof actions.overview>>;
  };

  invariant(actionsOverview, 'requestOverview was not found in loader data');

  const title = 'Median Duration';

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) {
    return <Metric.Skeleton title={title} compact />;
  }

  return (
    <Suspense fallback={<Metric.Skeleton title={title} compact />}>
      <Await resolve={actionsOverview} errorElement={<Metric.Error title={title} compact />}>
        {(resolvedActionsOverview) => {
          const {
            duration: { p50 },
          } = actionsOverviewEvent ?? resolvedActionsOverview;
          return <Metric title={title} value={formatDuration(p50, 'ns')} compact />;
        }}
      </Await>
    </Suspense>
  );
};
