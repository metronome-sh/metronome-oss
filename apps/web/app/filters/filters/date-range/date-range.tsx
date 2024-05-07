import { z } from 'zod';

import { Icon, Ping } from '#app/components';
import { type FilterDefinitionFunction } from '#app/filters/filters.types';

import { type DateRangeOptionIds, type DateRangeParsed } from './date-range.types';
import { areDatesInRange, isDifferenceGreaterThanDays } from './helpers';
import { Temporal } from '@js-temporal/polyfill';
import { getTimeZoneFromRequest } from '#app/utils/timeZone';

export const dateRangeWithAll = () => dateRange({ withAll: true });

export const dateRange = (options?: {
  /**
   * Include the "All" option in the date range
   */
  withAll?: boolean;
}) =>
  ({
    filterId: 'date-range',
    label: 'Date range',
    icon: Icon.Calendar,
    server: {
      parse: async (activeOption, request) => {
        const timeZone = getTimeZoneFromRequest(request);

        if (!activeOption.isCustom) {
          const [value] = activeOption.value;

          const now = Temporal.Now.instant().toZonedDateTimeISO(timeZone);

          if (value === 'all') {
            return {
              from: now.subtract({ years: 10 }),
              to: now.withPlainTime('23:59:59'),
            };
          }

          if (value === 'today') {
            return {
              from: now.withPlainTime('00:00:00'),
              to: now.withPlainTime('23:59:59'),
            };
          }

          if (value === 'yesterday') {
            const yesterday = now.subtract({ days: 1 });

            return {
              from: yesterday.withPlainTime('00:00:00'),
              to: yesterday.withPlainTime('23:59:59'),
            };
          }

          if (value === 'this-week') {
            const monday = now.withPlainTime('00:00:00').subtract({ days: now.dayOfWeek - 1 });
            const sunday = monday.add({ days: 7 }).withPlainTime('23:59:59');

            return {
              from: monday,
              to: sunday,
            };
          }

          if (value === 'last-seven-days') {
            const sevenDaysAgo = now.withPlainTime('00:00:00').subtract({ days: 6 });

            return {
              from: sevenDaysAgo,
              to: now.withPlainTime('23:59:59'),
            };
          }

          if (value === 'last-thirty-days') {
            const thirtyDaysAgo = now.withPlainTime('00:00:00').subtract({ days: 29 });

            return {
              from: thirtyDaysAgo,
              to: now.withPlainTime('23:59:59'),
            };
          }

          if (value === 'this-month') {
            const firstDayOfMonth = now.withPlainTime('00:00:00').with({ day: 1 });

            return {
              from: firstDayOfMonth,
              to: now.withPlainTime('23:59:59'),
            };
          }

          if (value === 'last-month') {
            const firstDayOfLastMonth = now
              .withPlainTime('00:00:00')
              .with({ day: 1 })
              .subtract({ months: 1 });
            const lastDayOfLastMonth = firstDayOfLastMonth.add({ months: 1 }).subtract({ days: 1 });

            return {
              from: firstDayOfLastMonth,
              to: lastDayOfLastMonth,
            };
          }

          if (value === 'this-year') {
            const firstDayOfYear = now.withPlainTime('00:00:00').with({ month: 1, day: 1 });

            return {
              from: firstDayOfYear,
              to: now.withPlainTime('23:59:59'),
            };
          }

          throw new Error('Unsupported date range');
        }

        // eslint-disable-next-line prefer-const
        let [fromString, toString] = activeOption.value as [string, string];

        if (!toString) {
          toString = fromString;
        }

        const from = Temporal.Instant.fromEpochMilliseconds(
          new Date(fromString).valueOf(),
        ).toZonedDateTimeISO(timeZone);

        const to = Temporal.Instant.fromEpochMilliseconds(
          new Date(toString).valueOf(),
        ).toZonedDateTimeISO(timeZone);

        const comparison = Temporal.ZonedDateTime.compare(from, to);

        // Always return the range in the correct order
        return {
          from: (comparison < 0 ? from : to).withPlainTime('00:00:00'),
          to: (comparison < 0 ? to : from).withPlainTime('23:59:59'),
        } as unknown as DateRangeParsed;
      },
    },
    initial: options?.withAll ? 'all' : 'today',
    options: [
      {
        optionId: 'all',
        hidden: !options?.withAll,
        label: (active) => (
          <span className="flex gap-2 items-center">
            All
            {active ? <Ping className="h-2 w-2" /> : null}
          </span>
        ),
        value: () => ['all'],
      },
      {
        optionId: 'today',
        label: (active) => (
          <span className="flex gap-2 items-center">
            Today
            {active ? <Ping className="h-2 w-2" /> : null}
          </span>
        ),
        value: () => ['today'],
        dependencies: {
          interval: () => z.tuple([z.literal('hourly')]),
        },
      },
      {
        optionId: 'yesterday',
        label: () => 'Yesterday',
        value: () => ['yesterday'],
        dependencies: {
          interval: () => z.tuple([z.literal('hourly')]),
        },
      },
      {
        optionId: 'this-week',
        label: () => 'This week',
        value: () => ['this-week'],
        dependencies: {
          interval: () => {
            return z.union([z.tuple([z.literal('hourly')]), z.tuple([z.literal('daily')])]);
          },
        },
      },
      {
        optionId: 'last-seven-days',
        label: () => 'Last 7 days',
        value: () => ['last-seven-days'],
        dependencies: {
          interval: () => {
            return z.union([z.tuple([z.literal('hourly')]), z.tuple([z.literal('daily')])]);
          },
        },
      },
      {
        optionId: 'last-thirty-days',
        label: () => 'Last 30 days',
        value: () => ['last-thirty-days'],
        dependencies: {
          interval: () => z.tuple([z.literal('daily')]),
        },
      },
      {
        optionId: 'this-month',
        label: () => 'This month',
        value: () => ['this-month'],
        dependencies: {
          interval: () => z.tuple([z.enum(['daily', 'weekly'])]),
        },
      },
      {
        optionId: 'last-month',
        label: () => 'Last month',
        value: () => ['last-month'],
        dependencies: {
          interval: () => z.tuple([z.enum(['daily', 'weekly'])]),
        },
      },
      {
        optionId: 'this-year',
        label: () => 'This year',
        value: () => ['this-year'],
        dependencies: {
          interval: () => z.tuple([z.literal('monthly')]),
        },
      },
    ],
    // custom: {
    //   description: 'Custom date range',
    //   component: CustomDateRange,
    //   label: CustomDateRangeLabel,
    //   validate: () =>
    //     z.union([
    //       z.tuple([z.string().datetime()]),
    //       z.tuple([z.string().datetime(), z.string().datetime()]),
    //     ]),
    //   dependencies: {
    //     interval: (selfValue, [dependencyValue]) => {
    //       // Prevent empty values to be evaluated
    //       if (selfValue.length === 0) return true;

    //       const [fromString, toString] = selfValue;

    //       if (!toString || fromString === toString) return dependencyValue === 'hourly';

    //       const from = new Date(fromString);
    //       const to = new Date(toString);

    //       // Check if from and to are the same day
    //       if (from.toDateString() === to.toDateString()) return dependencyValue === 'hourly';

    //       if (dependencyValue === 'hourly') return areDatesInRange(from, to, 1, 7);

    //       if (dependencyValue === 'daily') return areDatesInRange(from, to, 7, 31);

    //       if (dependencyValue === 'weekly') return areDatesInRange(from, to, 31, 365);

    //       if (dependencyValue === 'monthly') return isDifferenceGreaterThanDays(from, to, 365);

    //       return false;
    //     },
    //   },
    // },
  }) satisfies FilterDefinitionFunction<DateRangeOptionIds, DateRangeParsed>;
