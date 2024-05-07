import { useEventRouteData } from '#app/hooks/useEventRouteData';

import { type loader } from '../$teamSlug.$projectSlug.route';

export function useTeamProjectEventData(deps?: unknown) {
  return useEventRouteData<typeof loader>('$teamSlug.$projectSlug', deps);
}
