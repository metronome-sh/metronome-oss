import { Await } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';

import { useIsNavigatingSharedProject } from '#app/routes/shared/hooks/useIsNavigatingSharedProject';
import { useSharedProjectEventData } from '#app/routes/shared/hooks/useSharedProjectEventData';
import { useSharedProjectLoaderData } from '#app/routes/shared/hooks/useSharedProjectLoaderData';
import { Metric } from '#app/routes/teams/routes/projects/components';
import { formatNumber } from '#app/utils';

export const Errors: FunctionComponent = () => {
  const { actionsOverview } = useSharedProjectLoaderData();
  const { actionsOverview: actionsOverviewEvent } = useSharedProjectEventData();

  const title = 'Errors';

  const isNavigating = useIsNavigatingSharedProject();

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
