import { sessions } from '@metronome/db';
import * as Tabs from '@radix-ui/react-tabs';
import { Await, useLoaderData } from '@remix-run/react';
import { type FunctionComponent, Suspense } from 'react';
import { invariant } from 'ts-invariant';

import { Icon, TableWithBarChart, Tooltip } from '#app/components';
import { cn } from '#app/components/utils';
import { useEventData } from '#app/hooks/useEventData';
import { formatNumber } from '#app/utils';

import { useIsNavigatingWebAnalytics } from '../../../../hooks';

const osMap = {
  windows: Icon.BrandWindows,
  macos: Icon.BrandApple,
  ios: Icon.BrandApple,
  android: Icon.BrandAndroid,
  linux: Icon.BrandUbuntu,
};

export const OsTabContent: FunctionComponent = () => {
  const { devicesByOs } = useLoaderData() as {
    devicesByOs?: ReturnType<typeof sessions.devicesByOs>;
  };

  const { devicesByOs: devicesByOsEvent } = useEventData() as {
    devicesByOs?: Awaited<ReturnType<typeof sessions.devicesByOs>>;
  };

  invariant(devicesByOs, 'devicesByOs was not found in loader data');

  const isNavigating = useIsNavigatingWebAnalytics();

  return (
    <Tabs.Content value="os" asChild>
      {isNavigating ? (
        <TableWithBarChart.Skeleton />
      ) : (
        <Suspense fallback={<TableWithBarChart.Skeleton />}>
          <Await resolve={devicesByOs} errorElement={<TableWithBarChart.Error />}>
            {(resolvedDevicesByOs) => {
              return (
                <TableWithBarChart<keyof Awaited<typeof resolvedDevicesByOs>[number]>
                  data={devicesByOsEvent ?? resolvedDevicesByOs}
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
                    os: {
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
                          osMap && osMap[value as keyof typeof osMap]
                            ? osMap[value as keyof typeof osMap]
                            : Icon.DeviceDesktop;

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
