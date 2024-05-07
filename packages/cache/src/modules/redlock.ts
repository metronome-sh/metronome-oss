import { remember } from '@epic-web/remember';
import { env } from '@metronome/env';
import { Redis } from 'ioredis';
import Redlock, { type Lock } from 'redlock';

const { url, password, family } = env.cache({ unique: true });

export { type Lock };
export const redlock = remember('redlock', () => {
  const redis = new Redis(url, {
    maxRetriesPerRequest: null,
    password,
    family,
  });

  return new Redlock([redis], {
    // The expected clock drift; for more details see:
    // http://redis.io/topics/distlock
    driftFactor: 0.01, // multiplied by lock ttl to determine drift time

    // The max number of times Redlock will attempt to lock a resource
    // before erroring.
    retryCount: 100,

    // the time in ms between attempts
    retryDelay: 200, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200, // time in ms

    // The minimum remaining time on a lock before an extension is automatically
    // attempted with the `using` API.
    automaticExtensionThreshold: 500, // time in ms
  });
});
