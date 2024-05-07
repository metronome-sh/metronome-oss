import { useEventRouteData } from '#app/hooks/useEventRouteData';

import { type loader } from '../$teamSlug.$projectSlug.errors.route';

export function useErrorsEventData(deps?: unknown) {
  return useEventRouteData<typeof loader>('$teamSlug.$projectSlug.errors', deps);
}
