import { type SpanSchema } from './spans';
import { z } from 'zod';

export interface ClickHouseSpan {
  project_id: string;
  trace_id: string;
  span_id: string;
  parent_span_id: string | null;
  name: string;
  start_time: number;
  end_time: number;
  'span_attributes.key': string[];
  'span_attributes.value': string[];
}

export type SpanInput = z.infer<typeof SpanSchema>;

export type Span = {
  projectId: string;
  traceId: string;
  spanId: string;
  kind: number;
  parentSpanId: string;
  name: string;
  startTime: number;
  endTime: number;
  spanAttributes: Record<string, string>;
};
