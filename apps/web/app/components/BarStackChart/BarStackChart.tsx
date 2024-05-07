/* eslint-disable @typescript-eslint/no-explicit-any */
import { Temporal } from '@js-temporal/polyfill';
import { AxisBottom } from '@visx/axis';
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { BarStack } from '@visx/shape';
import { type SeriesPoint } from '@visx/shape/lib/types';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { type FunctionComponent, type ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { ClientOnly } from 'remix-utils/client-only';

import { filters, useFilterActiveOption } from '#app/filters';
import { useTimezoneId } from '#app/hooks/useTimezoneId';

import { Icon } from '..';
import { Spinner } from '../Spinner';

type BarStackSeriesData<T extends string | number> = BarStackSeriesDatum<T>[];

type BarStackSeriesDatum<T extends string | number> = {
  [key in T]: number | null;
} & {
  timestamp: number;
};

type TooltipData<T extends string | number> = {
  bar: SeriesPoint<BarStackSeriesDatum<T>>;
  key: T;
  index: number;
  height: number;
  width: number;
  x: number;
  y: number;
  color: string;
};

export type BarStackProps<T extends string | number> = {
  margin?: { top: number; right: number; bottom: number; left: number };
  events?: boolean;
  data: BarStackSeriesData<T>;
  labels: Record<Exclude<T, 'timestamp'>, ReactNode | ((value: number | null) => ReactNode)>;
  formatValues?: Record<Exclude<T, 'timestamp'>, (value: number | null) => ReactNode>;
  colors: string[];
};

const defaultMargin = { top: 0, right: 0, bottom: 0, left: 0 };

const BaseComponent = <T extends string | number>({
  events = false,
  margin = defaultMargin,
  data,
  labels,
  colors,
  formatValues,
}: BarStackProps<T>) => {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<TooltipData<T>>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // TooltipInPortal is rendered in a separate child of <body /> and positioned
    // with page coordinates which should be updated on scroll. consider using
    // Tooltip or TooltipWithBounds if you don't need to render inside a Portal
    scroll: true,
  });

  const keys = useMemo(() => Object.keys(data[0]).filter((d) => d !== 'timestamp') as T[], [data]);

  const valueTotals = useMemo(
    () =>
      data.reduce((allTotals, currentDate) => {
        const total = keys.reduce((dailyTotal, k) => {
          dailyTotal += Number(currentDate[k]);
          return dailyTotal;
        }, 0);
        allTotals.push(total);
        return allTotals;
      }, [] as number[]),
    [data, keys],
  );

  // accessors
  const getDate = useCallback((d: BarStackSeriesDatum<T>) => d.timestamp, []);

  const interval = useFilterActiveOption(filters.interval());

  const dateRange = useFilterActiveOption(filters.dateRange());

  const timeZoneId = useTimezoneId();

  const formatDate = useCallback(
    (timestamp: number, tooltip: boolean = false) => {
      const date = Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(timeZoneId);
      const [value] = interval.value;
      const [range] = dateRange.value;

      if ((value === 'hourly' && range === 'today') || range === 'yesterday') {
        return date.toLocaleString(undefined, { timeStyle: 'short' });
      }

      if (value === 'hourly') {
        return date.toLocaleString(undefined, {
          timeStyle: 'short',
          dateStyle: 'short',
        });
      }

      if (value === 'daily') {
        return date.toLocaleString(undefined, {
          dateStyle: tooltip ? 'long' : 'short',
        });
      }

      if (value === 'weekly') {
        return date.toLocaleString(undefined, {
          month: tooltip ? 'long' : 'short',
          year: tooltip ? 'numeric' : undefined,
          day: 'numeric',
        });
      }

      if (value === 'monthly') {
        return date.toLocaleString(undefined, {
          month: tooltip ? 'long' : 'short',
          year: 'numeric',
        });
      }

      throw Error(`Invalid interval value: ${value}`);
    },
    [interval.value, timeZoneId, dateRange.value],
  );

  // scales
  const dateScale = useMemo(
    () =>
      scaleBand<number>({
        domain: data.map(getDate),
        padding: 0.2,
      }),
    [data, getDate],
  );

  const valueScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...valueTotals)],
        nice: true,
      }),
    [valueTotals],
  );

  const colorScale = useMemo(
    () =>
      scaleOrdinal<T, string>({
        domain: keys,
        range: colors,
      }),
    [colors, keys],
  );

  let tooltipTimeout: number;

  const getLabel = useCallback(
    (key: string | number, value: number | null): ReactNode => {
      const label = labels[key as Exclude<T, 'timestamp'>];

      if (typeof label === 'function') {
        return label(value);
      }

      return label;
    },
    [labels],
  );

  const getFormattedValue = useCallback(
    (key: string | number, value: number | null): ReactNode => {
      const formatter = formatValues?.[key as Exclude<T, 'timestamp'>];

      if (!formatter) return value;

      return formatter(value);
    },
    [formatValues],
  );

  return (
    <div className="relative h-full w-full">
      <ParentSize>
        {({ height, width }: { height: number; width: number }) => {
          if (width < 10) return null;

          // bounds
          const xMax = width;
          const yMax = height - margin.top - 35;

          dateScale.rangeRound([0, xMax]);
          valueScale.range([yMax, 0]);

          return (
            <svg ref={containerRef} width={width} height={height}>
              <Group top={margin.top}>
                <BarStack<BarStackSeriesDatum<T>, T>
                  data={data}
                  keys={keys}
                  x={getDate}
                  xScale={dateScale}
                  yScale={valueScale}
                  color={colorScale}
                >
                  {(barStacks: any) =>
                    barStacks.map((barStack: any) =>
                      barStack.bars.map((bar: any) => (
                        <rect
                          key={`bar-stack-${barStack.index}-${bar.index}`}
                          x={bar.x}
                          y={bar.y}
                          height={bar.height}
                          width={bar.width}
                          fill={bar.color}
                          // rx={barStack.index === 1 ? '8' : undefined}
                          onClick={() => {
                            if (events) alert(`clicked: ${JSON.stringify(bar)}`);
                          }}
                          onMouseLeave={() => {
                            tooltipTimeout = window.setTimeout(() => {
                              hideTooltip();
                            }, 300);
                          }}
                          onMouseMove={(event) => {
                            if (tooltipTimeout) clearTimeout(tooltipTimeout);
                            // TooltipInPortal expects coordinates to be relative to containerRef
                            // localPoint returns coordinates relative to the nearest SVG, which
                            // is what containerRef is set to in this example.
                            const eventSvgCoords = localPoint(event);
                            const left = bar.x + bar.width / 2;
                            showTooltip({
                              tooltipData: bar,
                              tooltipTop: eventSvgCoords?.y,
                              tooltipLeft: left,
                            });
                          }}
                        />
                      )),
                    )
                  }
                </BarStack>
              </Group>
              <AxisBottom
                axisClassName="hidden sm:block"
                top={yMax + margin.top}
                scale={dateScale}
                tickFormat={(d: any) => formatDate(d)}
                stroke={'#9ca3af'}
                tickStroke={'#9ca3af'}
                tickLabelProps={{
                  fill: '#9ca3af',
                  fontSize: 10,
                  textAnchor: 'middle',
                  fontFamily: 'Outfit',
                }}
              />
            </svg>
          );
        }}
      </ParentSize>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          className="z-[9999] top-0 left-0 absolute rounded-md bg-muted px-4 py-1"
          top={tooltipTop}
          left={tooltipLeft}
          unstyled
        >
          <div className="flex gap-2">
            <div className="relative text-base font-medium text-white pr-4 flex items-center border-r border-gray-600">
              <div
                className="absolute top-0 bottom-0 -left-3 rounded-full w-1"
                style={{ backgroundColor: colorScale(tooltipData.key) }}
              />
              <span className="pl-1">
                {getFormattedValue(tooltipData.key, tooltipData.bar.data[tooltipData.key])}
              </span>
              {tooltipData.bar.data[tooltipData.key] != valueTotals[tooltipData.index] ? (
                <>
                  <span className="px-1 text-gray-500">/</span>
                  <span className="text-gray-500">{valueTotals[tooltipData.index]} </span>
                </>
              ) : null}
            </div>
            <div className="flex flex-col pl-1">
              <div className="text-sm font-medium text-gray-300">
                {getLabel(tooltipData.key, tooltipData.bar.data[tooltipData.key])}
              </div>
              <div className="text-xs text-gray-400">
                {formatDate(getDate(tooltipData.bar.data), true)}
              </div>
            </div>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
};

const Skeleton: FunctionComponent = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <Spinner className="-mt-12 h-8 w-8 " />
    </div>
  );
};

const ErrorComponent: FunctionComponent = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground">
      <Icon.AlertSquareRoundedOutline className="stroke-red-500" />
      <span className="text-sm">An error has occurred</span>
    </div>
  );
};

export const ClientBarStackChart = <T extends string | number>(props: BarStackProps<T>) => {
  return <ClientOnly>{() => <BaseComponent {...props} />}</ClientOnly>;
};

export const BarStackChart = Object.assign(ClientBarStackChart, {
  Skeleton,
  Error: ErrorComponent,
});
