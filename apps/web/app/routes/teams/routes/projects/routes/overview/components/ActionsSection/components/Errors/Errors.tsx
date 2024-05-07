import { actions } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { formatNumber } from '#app/utils';

import { Metric } from '../../../../../../components/Metric';
import { useIsNavigatingOverview } from '../../../../hooks';

export const Errors: FunctionComponent = () => {
  const { actionsOverview } = useLoaderData() as {
    actionsOverview?: ReturnType<typeof actions.overview>;
  };

  const { actionsOverview: actionsOverviewEvent } = useEventData() as {
    actionsOverview?: Awaited<ReturnType<typeof actions.overview>>;
  };

  invariant(actionsOverview, 'requestOverview was not found in loader data');

  const title = 'Errors';

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) {
    return <Metric.Skeleton title={title} compact />;
  }

  return (
    <Suspense fallback={<Metric.Skeleton title={title} compact />}>
      <Await resolve={actionsOverview} errorElement={<Metric.Error title={title} compact />}>
        {(resolvedActionsOverview) => {
          const { erroredCount } = actionsOverviewEvent ?? resolvedActionsOverview;
          return <Metric title={title} value={formatNumber(erroredCount, '0')} compact />;
        }}
      </Await>
    </Suspense>
  );
};
