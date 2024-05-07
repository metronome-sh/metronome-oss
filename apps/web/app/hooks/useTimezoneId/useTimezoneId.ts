import { useRootLoaderData } from '../useRootLoaderData';

export function useTimezoneId() {
  const { timeZoneId } = useRootLoaderData();
  return timeZoneId;
}
