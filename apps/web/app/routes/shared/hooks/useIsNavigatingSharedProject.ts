import { useIsNavigating } from '#app/hooks/useIsNavigating';

export function useIsNavigatingSharedProject() {
  return useIsNavigating('shared.$projectId');
}
