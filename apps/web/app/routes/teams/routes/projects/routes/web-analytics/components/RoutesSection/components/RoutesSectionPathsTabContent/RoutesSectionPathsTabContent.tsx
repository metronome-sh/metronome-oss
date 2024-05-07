import { pageviews } from '@metronome/db';
import * as Tabs from '@radix-ui/react-tabs';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { RouteDisplay, TableWithBarChart, Tooltip } from '#app/components';
import { cn } from '#app/components/utils';
import { useEventData } from '#app/hooks/useEventData';
import { formatNumber } from '#app/utils';

import { useIsNavigatingWebAnalytics } from '../../../../hooks';

export const RoutesSectionPathsTabContent: FunctionComponent = () => {
  const { routesByRoutePath } = useLoaderData() as {
    routesByRoutePath?: ReturnType<typeof pageviews.routesByRoutePath>;
  };

  const { routesByRoutePath: routesByRoutePathEvent } = useEventData() as {
    routesByRoutePath?: Awaited<ReturnType<typeof pageviews.routesByRoutePath>>;
  };

  invariant(routesByRoutePath, 'routesByRoutePath was not found in loader data');

  const isNavigating = useIsNavigatingWebAnalytics();

  return (
    <Tabs.Content value="paths" asChild>
      {isNavigating ? (
        <TableWithBarChart.Skeleton />
      ) : (
        <Suspense fallback={<TableWithBarChart.Skeleton />}>
          <Await resolve={routesByRoutePath} errorElement={<TableWithBarChart.Error />}>
            {(resolvedRoutesByRoutePath) => {
              return (
                <TableWithBarChart<keyof Awaited<typeof resolvedRoutesByRoutePath>[number]>
                  data={routesByRoutePathEvent ?? resolvedRoutesByRoutePath}
                  valueKey="uniqueUserIds"
                  headers={{
                    uniqueUserIds: {
                      className: 'text-right',
                      label: 'Visitors',
                    },
                    routePath: { label: 'Path' },
                  }}
                  cells={{
                    routePath: {
                      render: (value, props) => {
                        return (
                          <span {...props}>
                            <RouteDisplay route={`${value}`} />
                          </span>
                        );
                      },
                    },
                    uniqueUserIds: {
                      size: 70,
                      render: (value, { className, ...props }) => (
                        <div className={cn(className, 'text-right')} {...props}>
                          {(value as number) < 1000 ? (
                            value.toLocaleString()
                          ) : (
                            <Tooltip.Provider>
                              <Tooltip>
                                <Tooltip.Trigger disabled={(value as number) < 1000}>
                                  {formatNumber(value as number)}
                                </Tooltip.Trigger>
                                <Tooltip.Content>
                                  <p>{value.toLocaleString()}</p>
                                </Tooltip.Content>
                              </Tooltip>
                            </Tooltip.Provider>
                          )}
                        </div>
                      ),
                    },
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
