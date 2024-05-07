import { env } from '@metronome/env';
import { queues } from '@metronome/queues';

import { aggregations } from './aggregations';
import { events } from './events';
import { metrics } from './metrics';
import { otelSpans } from './otelSpans';
import { otelMetrics } from './otelMetrics';
import { rotateSalts } from './rotateSalts';

console.log('[workers]', 'Initializing queues');

queues.metrics.worker(metrics, env.when({ production: 10, development: 1 }));
queues.events.worker(events, env.when({ production: 10, development: 1 }));
queues.otelSpans.worker(otelSpans, env.when({ production: 5, development: 1 }));
queues.otelMetrics.worker(otelMetrics, env.when({ production: 5, development: 1 }));

queues.aggregations.worker(aggregations, 1);

queues.rotateSalts.worker(rotateSalts, 1);
