import { queues } from '@metronome/queues';

export async function events(job: typeof queues.events.$inferJob) {
  const { data } = job;
  return data;
}
