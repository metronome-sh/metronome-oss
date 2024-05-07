import { Temporal } from '@js-temporal/polyfill';

export function formatTemporalDuration(duration: Temporal.Duration) {
  if (duration.years > 0) {
    return `${duration.years} year${duration.years > 1 ? 's' : ''} ago`;
  } else if (duration.months > 0) {
    return `${duration.months} month${duration.months > 1 ? 's' : ''} ago`;
  } else if (duration.weeks > 0) {
    return `${duration.weeks} week${duration.weeks > 1 ? 's' : ''} ago`;
  } else if (duration.days > 0) {
    return `${duration.days} day${duration.days > 1 ? 's' : ''} ago`;
  } else if (duration.hours > 0) {
    return `${duration.hours} hour${duration.hours > 1 ? 's' : ''} ago`;
  } else if (duration.minutes > 0) {
    return `${duration.minutes} minute${duration.minutes > 1 ? 's' : ''} ago`;
  } else {
    return `Just now`;
  }
}
