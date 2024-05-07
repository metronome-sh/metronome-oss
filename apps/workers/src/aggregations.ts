import { refreshAggregation } from '@metronome/db';
import { queues } from '@metronome/queues';

export async function aggregations(job: typeof queues.aggregations.$inferJob) {
  const { data } = job;
  const { aggregation, watermark } = data;

  await refreshAggregation({ aggregation, watermark });

  return `aggregation for ${aggregation} completed`;
}
