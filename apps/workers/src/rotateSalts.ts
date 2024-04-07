import { projects } from '@metronome/db';
import { queues } from '@metronome/queues';
import { env } from '@metronome/env';

queues.rotateSalts.add(undefined, {
  jobId: 'rotate-salts',
  repeat: {
    pattern: env.when({
      production: '0 0 * * *',
      development: '* * * * *',
    }),
  },
});

export async function rotateSalts(job: typeof queues.rotateSalts.$inferJob) {
  await projects.rotateSalts();
}
