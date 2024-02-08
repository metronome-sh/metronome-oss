import { env } from '@metronome/env';
import { queues } from '@metronome/queues';

import { aggregations } from './aggregations';
import { events } from './events';
import { metrics } from './metrics';

console.log('[workers]', 'Initializing queues');

queues.metrics.worker(metrics, env.when({ production: 10, development: 1 }));
queues.events.worker(events, env.when({ production: 10, development: 1 }));
queues.aggregations.worker(aggregations, 1);
