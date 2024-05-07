import { useContext } from 'react';
import { invariant } from 'ts-invariant';

import { EventContext } from './EventContext';

export function useEventContext() {
  const context = useContext(EventContext);

  invariant(context, 'useEventContext must be used within an EventProvider');

  return context;
}
