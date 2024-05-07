import { sessions } from '@metronome/db';
import * as Tabs from '@radix-ui/react-tabs';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent } from 'react';
import { Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { useEventData } from '#app/hooks/useEventData';
import { Metric } from '#app/routes/teams/routes/projects/components/Metric';
import { formatNumber } from '#app/utils';

import { useIsNavigatingWebAnalytics } from '../../../../hooks';

export const VisitorsRightNowTabTrigger: FunctionComponent = () => {
  const { visitorsRightNow } = useLoaderData() as {
    visitorsRightNow?: ReturnType<typeof sessions.visitorsRightNow>;
  };

  const { visitorsRightNow: visitorsRightNowEvent } = useEventData() as {
    visitorsRightNow?: Awaited<ReturnType<typeof sessions.visitorsRightNow>>;
  };

  invariant(visitorsRightNow, 'visitorsRightNow was not found in loader data');

  const title = 'Visitors right now';

  const isNavigating = useIsNavigatingWebAnalytics();

  if (isNavigating) return <Metric.Skeleton title={title} compact />;

  return (
    <Suspense fallback={<Metric.Skeleton title={title} compact />}>
      <Await resolve={visitorsRightNow} errorElement={<Metric.Error title={title} compact />}>
        {(resolvedVisitorsRightNow) => {
          // prettier-ignore
          const value = visitorsRightNowEvent ?? resolvedVisitorsRightNow ?? 0;

          return (
            <Tabs.Trigger value="visitors" asChild>
              <Metric
                compact
                title={title}
                value={formatNumber(value)}
                containerClassName="relative group cursor-pointer"
              >
                <div className="absolute inset-y-1 left-1 w-1 rounded-full bg-muted group-[[data-state=active]]:bg-teal-600" />
              </Metric>
            </Tabs.Trigger>
          );
        }}
      </Await>
    </Suspense>
  );
};
