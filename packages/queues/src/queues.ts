import { env } from '@metronome/env';
import EventEmitter from 'events';

// TODO Change thig to set the emitter max listeners instead
// of disabling the warning
EventEmitter.defaultMaxListeners = 1_000_000;

import { createQueue } from './createQueue';

const commonConfig = {
  removeOnComplete: true,
  removeOnFail: true,
  attempts: env.when({ production: 288 * 2, development: 0 }), // 2 days worth of attempts
  backoff: {
    type: 'fixed',
    delay: 1000 * 60 * 5, // 5 minutes
  },
};

export const metrics = createQueue<{ apiKey: string; data: unknown }>('metrics', commonConfig);

export const legacyMetrics = createQueue<{ apiKey: string; data: unknown }>(
  'legacy-metrics',
  commonConfig,
);

export const events = createQueue<
  {
    projectId: string;
    eventsNames: string[];
    ts: number;
  },
  {
    projectId: string;
    eventsNames: string[];
    ts: number;
  }
>('events', {
  removeOnComplete: true,
  removeOnFail: true,
  priority: 1,
  attempts: 1,
});

export const aggregations = createQueue<{
  aggregation: string;
  watermark: '1 hour' | '1 day' | '1 week' | '1 month';
}>('aggregations', {
  removeOnComplete: true,
  removeOnFail: true,
  priority: 1,
  attempts: 1,
});

export const otelSpans = createQueue<{
  apiKey: string;
  spans: unknown;
}>('otel-spans', commonConfig);

export const otelMetrics = createQueue<{
  apiKey: string;
  metrics: unknown;
}>('otel-metrics', commonConfig);

export const rotateSalts = createQueue('rotate-salts');
