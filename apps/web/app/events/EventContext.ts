import { createContext } from 'react';

export type EventContextValue = {
  eventTarget: EventTarget | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EventContext = createContext<EventContextValue>(null as any);
