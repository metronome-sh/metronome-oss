import { Temporal } from '@js-temporal/polyfill';

export function getTimeZoneOffset(timeZoneId: string): string {
  const now = Temporal.Now.zonedDateTimeISO(timeZoneId).toInstant();

  const offset =
    Temporal.TimeZone.from(timeZoneId).getOffsetStringFor?.(now) ?? '+00:00';

  return offset;
}
