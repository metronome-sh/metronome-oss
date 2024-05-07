import { formatTemporalDuration } from '#app/utils/formatTemporalDuration';
import { ProjectError } from '@metronome/db';
import { Temporal } from '@js-temporal/polyfill';
import { useMemo } from 'react';

export function useRelativeErrorDates(error: ProjectError) {
  return useMemo(() => {
    const now = Temporal.Now.plainDateTimeISO('UTC');

    const firstSeen = Temporal.Instant.fromEpochMilliseconds(error.firstSeen).toZonedDateTimeISO(
      'UTC',
    );

    const lastSeen = Temporal.Instant.fromEpochMilliseconds(error.lastSeen).toZonedDateTimeISO(
      'UTC',
    );

    const firstSeenFormatted = firstSeen.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const lastSeenFormatted = lastSeen.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    });

    // const lastSeenFormatted = lastSeen.toString();

    return {
      firstSeenFormatted,
      lastSeenFormatted,
      relativeFirstSeen: formatTemporalDuration(now.until(firstSeen).negated()),
      relativeLastSeen: formatTemporalDuration(now.until(lastSeen).negated()),
    };
  }, [error.firstSeen, error.lastSeen]);
}
