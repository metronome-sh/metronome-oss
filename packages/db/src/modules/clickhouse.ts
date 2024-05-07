import { createClient } from '@clickhouse/client';
import { remember } from '@epic-web/remember';
import { env } from '@metronome/env';

const { database, host, password, port, username } = env.clickhouse();

export const clickhouse = remember('clickhouse', () =>
  createClient({
    host: `${host}:${port}`,
    username,
    password,
    database,
  }),
);
