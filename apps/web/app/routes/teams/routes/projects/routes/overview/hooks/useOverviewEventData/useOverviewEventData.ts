import { useEventRouteData } from '#app/hooks/useEventRouteData';

import { type loader } from '../../$teamSlug.$projectSlug.overview.route';

export function useOverviewEventData() {
  return useEventRouteData<typeof loader>('$teamSlug.$projectSlug.overview');
}
