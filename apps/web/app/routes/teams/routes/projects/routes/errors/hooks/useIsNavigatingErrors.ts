import { useIsNavigating } from '#app/hooks/useIsNavigating';

const routeId = '$teamSlug.$projectSlug.errors';

export function useIsNavigatingErrors() {
  return useIsNavigating(routeId);
}
