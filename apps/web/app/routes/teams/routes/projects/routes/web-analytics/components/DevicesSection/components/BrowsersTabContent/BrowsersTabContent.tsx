import { sessions } from '@metronome/db';
import * as Tabs from '@radix-ui/react-tabs';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { cn, Icon, TableWithBarChart, Tooltip } from '#app/components';
import { useEventData } from '#app/hooks/useEventData';
import { formatNumber } from '#app/utils';

import { useIsNavigatingWebAnalytics } from '../../../../hooks';

const browserMap = {
  chrome: Icon.BrandChrome,
  opera: Icon.BrandOpera,
  firefox: Icon.BrandFirefox,
  safari: Icon.BrandSafari,
  edge: Icon.BrandEdge,
  ie: Icon.BrandEdge,
};

export const BrowsersTabContent: FunctionComponent = () => {
  const { devicesByBrowser } = useLoaderData() as {
    devicesByBrowser?: ReturnType<typeof sessions.devicesByBrowser>;
  };

  const { devicesByBrowser: devicesByBrowserEvent } = useEventData() as {
    devicesByBrowser?: Awaited<ReturnType<typeof sessions.devicesByBrowser>>;
  };

  invariant(devicesByBrowser, 'devicesByBrowser was not found in loader data');

  const isNavigating = useIsNavigatingWebAnalytics();

  return (
    <Tabs.Content value="browsers" asChild>
      {isNavigating ? (
        <TableWithBarChart.Skeleton />
      ) : (
        <Suspense fallback={<TableWithBarChart.Skeleton />}>
          <Await resolve={devicesByBrowser} errorElement={<TableWithBarChart.Error />}>
            {(resolvedDevicesByBrowser) => {
              return (
                <TableWithBarChart<keyof Awaited<typeof resolvedDevicesByBrowser>[number]>
                  data={devicesByBrowserEvent ?? resolvedDevicesByBrowser}
                  valueKey="uniqueUserIds"
                  headers={{
                    id: { hidden: true },
                    uniqueUserIds: {
                      className: 'text-right',
                      label: 'Visitors',
                    },
                  }}
                  cells={{
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
                    browser: {
                      render: (value, { className, ...props }) => (
                        <div {...props} className={cn(className, 'pl-0')}>
                          {value}
                        </div>
                      ),
                    },
                    id: {
                      size: 40,
                      render: (value, { className, ...props }) => {
                        const IconFromMap =
                          browserMap && browserMap[value as keyof typeof browserMap]
                            ? browserMap[value as keyof typeof browserMap]
                            : Icon.World;

                        return (
                          <div className={cn(className, 'relative')} {...props}>
                            <div className="absolute inset-0 flex items-center justify-center pl-1">
                              <IconFromMap />
                            </div>
                          </div>
                        );
                      },
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
