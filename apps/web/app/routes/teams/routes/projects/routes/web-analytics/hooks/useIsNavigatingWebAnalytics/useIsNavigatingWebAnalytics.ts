import { useIsNavigating } from '#app/hooks/useIsNavigating';

export function useIsNavigatingWebAnalytics() {
  return useIsNavigating('$teamSlug.$projectSlug.web-analytics');
}
