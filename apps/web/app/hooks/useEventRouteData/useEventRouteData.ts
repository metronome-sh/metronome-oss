import { SerializeFrom } from '@remix-run/node';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useEventContext } from '#app/events/useEventContext';

export function useEventRouteData<TData>(
  routeId: string,
  deps?: unknown,
): Partial<Awaited<SerializeFrom<UnwrapDeferred<TData>>>> {
  const { eventTarget } = useEventContext();
  const [data, setData] = useState<Partial<UnwrapDeferred<TData>>>({});
  const timestampsRef = useRef<Record<string, number>>({});

  const eventCallback = useCallback(
    (event: CustomEvent<{ data: Partial<UnwrapDeferred<TData>>; ts: number }>) => {
      const { data: eventData, ts } = event.detail;

      setData((prevData) => {
        const newState = { ...prevData };

        for (const key in eventData) {
          const previousTimestamp = timestampsRef.current[key] ?? 0;

          // Only update if this is newer data
          if (ts >= previousTimestamp) {
            newState[key] = eventData[key];
            // Update timestamps
            timestampsRef.current[key] = ts;
          }
        }

        return newState;
      });
    },
    [],
  );

  useEffect(() => {
    eventTarget?.addEventListener(routeId, eventCallback as EventListenerOrEventListenerObject);
    return () => {
      eventTarget?.removeEventListener(
        routeId,
        eventCallback as EventListenerOrEventListenerObject,
      );
      setData({});
    };
  }, [eventCallback, eventTarget, routeId, deps]);

  return data as Partial<Awaited<SerializeFrom<UnwrapDeferred<TData>>>>;
}
