import { useIsNavigating } from '#app/hooks/useIsNavigating';

const routeId = '$teamSlug.$projectSlug.web-vitals';

export function useIsNavigatingWebVitals() {
  return useIsNavigating(routeId);
}
