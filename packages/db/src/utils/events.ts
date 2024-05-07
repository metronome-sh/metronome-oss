import { remember } from '@epic-web/remember';
import { queues } from '@metronome/queues';
import { filter, fromEvent, Observable } from 'rxjs';
import { Project } from 'src/types';

export { throttleTime } from 'rxjs/operators';

export const observable = remember('db-observable', () => {
  return fromEvent(queues.events.events, 'completed') as Observable<
    typeof queues.events.$inferCompletedEventArgs
  >;
});

export const operators = {
  project: (project: Project) => {
    return filter(([e]: typeof queues.events.$inferCompletedEventArgs) => {
      return e.returnvalue.projectId === project.id;
    });
  },
  events: (events: string[]) => {
    return filter(([e]: typeof queues.events.$inferCompletedEventArgs) => {
      return e.returnvalue.eventsNames.some((e) => events.includes(e));
    });
  },
};
