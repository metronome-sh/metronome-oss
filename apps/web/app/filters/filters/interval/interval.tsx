import { z } from 'zod';

import { Icon } from '#app/components';
import { type FilterDefinitionFunction } from '#app/filters/filters.types';

import {
  areDatesInRange,
  isDateDifferenceWithinDays,
  isDifferenceGreaterThanDays,
} from '../date-range/helpers';
import { type IntervalOptionIds, type IntervalParsed } from './interval.types';

export const interval = () =>
  ({
    filterId: 'interval',
    label: 'Interval',
    icon: Icon.Alarm,
    server: {
      parse: (activeOption) => {
        const [value] = activeOption.value;

        switch (value) {
          case 'hourly':
            return 'hour';
          case 'daily':
            return 'day';
          case 'weekly':
            return 'week';
          case 'monthly':
            return 'month';
          default:
            throw new Error('Invalid interval');
        }
      },
    },
    initial: 'hourly',
    options: [
      {
        optionId: 'hourly',
        label: () => 'Hourly',
        value: () => ['hourly'],
        dependencies: {
          'date-range': () => {
            return z.union([
              z.tuple([z.literal('today')]),
              z.tuple([z.literal('yesterday')]),
              z.tuple([z.literal('this-week')]),
              z.tuple([z.literal('last-seven-days')]),
              z.array(z.string().datetime()).refine(([from, to]) => {
                if (!to || from === to) return true;
                const isValid = areDatesInRange(new Date(from), new Date(to), 1, 7);
                return isValid;
              }),
            ]);
          },
        },
      },
      {
        optionId: 'daily',
        label: () => 'Daily',
        value: () => ['daily'],
        dependencies: {
          'date-range': () => {
            return z.union([
              z.tuple([z.literal('this-week')]),
              z.tuple([z.literal('last-seven-days')]),
              z.tuple([z.literal('last-thirty-days')]),
              z.tuple([z.literal('this-month')]),
              z.tuple([z.literal('last-month')]),
              z.tuple([z.string().datetime(), z.string().datetime()]).refine(([from, to]) => {
                return isDateDifferenceWithinDays(new Date(from), new Date(to), 31);
              }),
            ]);
          },
        },
      },
      {
        optionId: 'weekly',
        label: () => 'Weekly',
        value: () => ['weekly'],
        dependencies: {
          'date-range': () => {
            return z.union([
              z.tuple([z.literal('this-month')]),
              z.tuple([z.literal('last-month')]),
              z.tuple([z.string().datetime(), z.string().datetime()]).refine(([from, to]) => {
                return areDatesInRange(new Date(from), new Date(to), 31, 365);
              }),
            ]);
          },
        },
      },
      {
        optionId: 'monthly',
        label: () => 'Monthly',
        value: () => ['monthly'],
        dependencies: {
          'date-range': () => {
            return z.union([
              z.tuple([z.literal('this-year')]),
              z.tuple([z.string().datetime(), z.string().datetime()]).refine(([from, to]) => {
                return isDifferenceGreaterThanDays(new Date(from), new Date(to), 365);
              }),
            ]);
          },
        },
      },
    ],
  }) satisfies FilterDefinitionFunction<IntervalOptionIds, IntervalParsed>;
