import { sessions } from '@metronome/db';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { Metric } from '#app/routes/teams/routes/projects/components';
import { formatNumber } from '#app/utils';

import { useIsNavigatingOverview } from '../../../../hooks';

export const VisitorsRightNow: FunctionComponent = () => {
  const { visitorsRightNow } = useLoaderData() as {
    visitorsRightNow?: ReturnType<typeof sessions.visitorsRightNow>;
  };

  const { visitorsRightNow: visitorsRightNowEvent } = useEventData() as {
    visitorsRightNow?: Awaited<ReturnType<typeof sessions.visitorsRightNow>>;
  };

  invariant(visitorsRightNow, 'requestOverview was not found in loader data');

  const title = 'Visitors right now';

  const isNavigating = useIsNavigatingOverview();

  if (isNavigating) return <Metric.Skeleton title={title} />;

  return (
    <Suspense fallback={<Metric.Skeleton title={title} />}>
      <Await resolve={visitorsRightNow} errorElement={<Metric.Error title={title} />}>
        {(resolvedVisitorsRightNow) => {
          // prettier-ignore
          const value = visitorsRightNowEvent ?? resolvedVisitorsRightNow;
          return <Metric title={title} value={formatNumber(value)} />;
        }}
      </Await>
    </Suspense>
  );
};
