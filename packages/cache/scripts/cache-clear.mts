import IOredis from 'ioredis';
import { env } from '@metronome/env';

(async () => {
  const PREFIX = 'metronome_cache:';

  const { url, password, family } = env.cache();
  const client = new IOredis(url, { maxRetriesPerRequest: null, password, family });

  let cursor = '0';

  do {
    const reply = await client.scan(cursor, 'MATCH', `${PREFIX}*`, 'COUNT', 100);
    cursor = reply[0];
    const keys = reply[1];

    await Promise.all(
      keys.map(async (key) => {
        await client.del(key, (err, reply) => {
          if (err) throw err;
          else console.log(`Deleted key ${key}:`, reply);
        });
      }),
    );
  } while (cursor !== '0');

  process.exit(0);
})();
