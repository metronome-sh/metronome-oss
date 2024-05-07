import { useLocation, useMatches, useNavigation } from '@remix-run/react';
import { type FunctionComponent, type PropsWithChildren } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useRootLoaderData } from '#app/hooks/useRootLoaderData';
import { useWindowVisibility } from '#app/hooks/useWindowVisibility';

import { EventContext } from './EventContext';

export const EventProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const { observableRoutes } = useRootLoaderData();
  const matches = useMatches();

  const routesToObserve = useMemo(() => {
    return matches.filter((match) => observableRoutes.includes(match.id));
  }, [observableRoutes, matches]);

  const navigation = useNavigation();

  const location = useLocation();

  const isWindowVisible = useWindowVisibility(0);

  const timeoutRef = useRef<NodeJS.Timeout>();

  const [reconnectAttempts, setReconnectAttempts] = useState(Number.MAX_SAFE_INTEGER);

  const [eventTarget, setEventTarget] = useState<EventTarget>(new EventTarget());

  useEffect(() => {
    if (navigation.state === 'idle') {
      setEventTarget(new EventTarget());
    }
  }, [navigation.state]);

  useEffect(() => {
    if (!isWindowVisible) return;

    const eventSources = routesToObserve.map((route) => {
      const pathname = route.pathname.replace(/\/$/, '');

      const search = new URLSearchParams(location.search);
      search.set('__pathname__', location.pathname);

      const url = `${pathname}/events?${search.toString()}`;
      const eventSource = new EventSource(url);

      eventSource.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);

        eventTarget.dispatchEvent(new CustomEvent(data.routeId, { detail: data.detail }));
      });

      eventSource.addEventListener('error', () => {
        clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
          setReconnectAttempts((value) => value - 1);
        }, 5000);
      });

      return eventSource;
    });

    return () => {
      clearTimeout(timeoutRef.current);

      eventSources.forEach((eventSource) => {
        eventSource.close();
      });
    };
  }, [reconnectAttempts, eventTarget, location, isWindowVisible]);

  const autoRefreshTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isWindowVisible) return;

    autoRefreshTimeoutRef.current = setInterval(() => {
      setReconnectAttempts((attempts) => attempts - 1);
    }, 50 * 1000);

    return () => {
      clearTimeout(autoRefreshTimeoutRef.current);
    };
  }, [isWindowVisible]);

  return <EventContext.Provider value={{ eventTarget }}>{children}</EventContext.Provider>;
};
