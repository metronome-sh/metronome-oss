import { Project } from '../../types';
import { clickhouse } from '../../modules/clickhouse';
import { Span, SpanInput } from '../spans/spans.types';
import { ClickHouseEvent, Event, EventWithSpan } from './events.types';
import { z } from 'zod';
import { createErrorHouseKeepingFromEvents } from '../errors/errors';
import { convertQueryResultToObject } from 'src/utils/convertClickHouseResultToObject';

export const EventSchema = z.object({
  name: z.string(),
  attributes: z.record(z.string()),
  timestamp: z.number(),
});

export async function createFromSpans({
  spanOrSpans,
  project,
}: {
  spanOrSpans: SpanInput | SpanInput[];
  project: Project;
}): Promise<void> {
  const spans = Array.isArray(spanOrSpans) ? spanOrSpans : [spanOrSpans];

  const events: ClickHouseEvent[] = spans.flatMap((s) => {
    return s.events.map((e) => {
      const attributesKeys = Object.keys(e.attributes);
      const attributesValues = Object.values(e.attributes);

      return {
        project_id: project.id,
        trace_id: s.context.traceId,
        span_id: s.id,
        name: e.name,
        timestamp: e.timestamp,
        'event_attributes.key': attributesKeys,
        'event_attributes.value': attributesValues,
      };
    });
  });

  await clickhouse.insert({
    table: 'events',
    values: events,
    format: 'JSONEachRow',
  });

  await createErrorHouseKeepingFromEvents({ events, project });
}

export async function find({
  project,
  id,
}: {
  project: Project;
  id: string;
}): Promise<EventWithSpan | null> {
  const result = await clickhouse.query({
    query: `
      select
      e.id AS events__id,
      e.project_id AS events__project_id,
      e.trace_id AS events__trace_id,
      e.span_id AS events__span_id,
      e.timestamp AS events__timestamp,
      e.name AS events__name,
      e.\`event_attributes.key\` AS \`events__event_attributes.key\`,
      e.\`event_attributes.value\` AS \`events__event_attributes.value\`,
      s.project_id AS spans__project_id,
      s.trace_id AS spans__trace_id,
      s.span_id AS spans__span_id,
      s.kind AS spans__kind,
      s.parent_span_id AS spans__parent_span_id,
      s.name AS spans__name,
      s.start_time AS spans__start_time,
      s.end_time AS spans__end_time,
      s.\`span_attributes.key\` AS \`spans__span_attributes.key\`,
      s.\`span_attributes.value\` AS \`spans__span_attributes.value\`
      from 
        events as e
      inner join spans as s
        on e.span_id = s.span_id
      where
        e.project_id = {projectId: String}
        and e.id = {id: String}
      `,
    query_params: {
      projectId: project.id,
      id,
    },
    format: 'JSONEachRow',
  });

  const json = await result.json<
    {
      id: string;
      trace_id: string;
      name: string;
      timestamp: string;
      'event_attributes.key': string[];
      'event_attributes.value': string[];
      'span_attributes.key': string[];
      'span_attributes.value': string[];
    }[]
  >();

  if (!json.length) return null;

  const [event] = convertQueryResultToObject<Event>(json, { prefix: 'events__' });

  const [span] = convertQueryResultToObject<Span>(json, {
    prefix: 'spans__',
    attributesDenyList: ['client.address', 'user_agent.original'],
  });

  return { ...event, span };
}
