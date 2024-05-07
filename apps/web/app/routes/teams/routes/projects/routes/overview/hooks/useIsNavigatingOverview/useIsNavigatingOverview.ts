import { useIsNavigating } from '#app/hooks/useIsNavigating';

export function useIsNavigatingOverview() {
  return useIsNavigating('$teamSlug.$projectSlug.overview');
}
