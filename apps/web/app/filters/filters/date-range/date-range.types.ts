import { type Temporal } from '@js-temporal/polyfill';

export interface DateRangeParsed {
  from: Temporal.ZonedDateTime;
  to: Temporal.ZonedDateTime;
}

export type DateRangeOptionIds =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this-month'
  | 'this-week'
  | 'this-year'
  | 'last-seven-days'
  | 'last-thirty-days'
  | 'last-month';
