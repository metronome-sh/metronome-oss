import { env } from '@metronome/env';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle as Drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import path from 'path';
import { fileURLToPath } from 'url';

let retries = 10;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectAndMigrate = async () => {
  while (retries !== 0) {
    try {
      const sql = postgres(env.db().writableUrl, { max: 1 });

      const drizzle = Drizzle(sql);

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      await migrate(drizzle, {
        migrationsFolder: `${__dirname}/migrations`,
      });

      console.log('Migrations complete');
      process.exit(0);
    } catch (error) {
      retries--;
      // prettier-ignore
      console.error(error.message);
      console.error(`Failed to connect to the database. Retries left ${retries}`);
      await sleep(3000); // Wait for 3 seconds before retrying
    }
  }
  console.error('Max retries reached. Exiting.');
  process.exit(1);
};

connectAndMigrate();
