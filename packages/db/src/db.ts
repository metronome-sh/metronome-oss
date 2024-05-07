import { remember } from '@epic-web/remember';
import { env } from '@metronome/env';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

import * as schema from './schema/schema';

export const db = remember('drizzle', () => {
  const { readableUrl, writableUrl } = env.db();

  const poolConfig = {
    max: 100,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    // log: (message: unknown) => console.log(message),
  };

  const readablePg = new Pool({ connectionString: readableUrl, ...poolConfig });
  const writablePg = new Pool({ connectionString: writableUrl, ...poolConfig });

  const readableDrizzle = drizzle(readablePg, { schema });
  const writableDrizzle = drizzle(writablePg, { schema });

  return (options?: { write?: boolean }) => {
    return options?.write ? writableDrizzle : readableDrizzle;
  };
});
