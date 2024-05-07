import { CamelCasedProperties, SetFieldType } from 'type-fest';
import { type EventSchema } from './events';
import { z } from 'zod';
import { Span } from '../spans/spans.types';

export interface ClickHouseEvent {
  project_id: string;
  trace_id: string;
  span_id: string;
  timestamp: number;
  name: string;
  'event_attributes.key': string[];
  'event_attributes.value': string[];
}

export type EventInput = z.infer<typeof EventSchema>;

export type Event = {
  id: string;
  projectId: string;
  traceId: string;
  spanId: string;
  timestamp: number;
  name: string;
  eventAttributes: Record<string, string>;
};

export type EventWithSpan = Event & {
  span: Span;
};
