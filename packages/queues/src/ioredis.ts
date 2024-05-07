import { remember } from '@epic-web/remember';
import { env } from '@metronome/env';
import IOredis from 'ioredis';

export const ioredis = remember('cache.ioredis', () => {
  const { url, password, family } = env.cache();
  return new IOredis(url, { maxRetriesPerRequest: null, password, family });
});
