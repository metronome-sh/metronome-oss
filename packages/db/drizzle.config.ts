import type { Config } from 'drizzle-kit';
import { env } from '@metronome/env';

export default {
  schema: './src/schema/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: env.db().writableUrl,
  },
} satisfies Config;
