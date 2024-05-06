import { Reader, ReaderModel } from '@maxmind/geoip2-node';
import { env } from '@metronome/env';
import fs from 'fs';
import path from 'path';

const resolvedUnknown = {
  countryCode: 'unknown',
  country: 'unknown',
  region: 'unknown',
  city: 'unknown',
};

let readerInstance: ReaderModel;
let noMaxmindEnvMessageShown = false;

function getReader(): ReaderModel {
  if (env.geoip().licenseKey === undefined) {
    if (!noMaxmindEnvMessageShown) {
      console.warn(
        'No MAXMIND_LICENSE_KEY environment variable found. Please set it to download the GeoIP database.',
      );
      noMaxmindEnvMessageShown = true;
    }

    throw new Error('MAXMIND_LICENSE_KEY');
  }

  if (readerInstance) {
    return readerInstance;
  }

  const __dirname = path.dirname(new URL(import.meta.url).pathname);

  const { database } = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../geoip/manifest.json'), 'utf-8'),
  );

  const databaseDir = database;

  const dbBuffer = fs.readFileSync(databaseDir);
  readerInstance = Reader.openBuffer(dbBuffer);

  return readerInstance;
}

export function resolveIp(ip: string): {
  countryCode: string;
  country: string;
  region: string;
  city: string;
} {
  let reader: ReaderModel;

  try {
    reader = getReader();
  } catch (error) {
    if ((error as Error).message !== 'MAXMIND_LICENSE_KEY') {
      console.warn('Could not find GeoIP database: ', (error as Error).message);
    }

    return resolvedUnknown;
  }

  try {
    const resolved = env.when({
      production: () => reader.city(ip),
      development: () => {
        // prettier-ignore
        const devIp = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
        return reader.city(devIp);
      },
    });

    const countryCode = resolved.country?.isoCode ?? 'unknown';
    const country = resolved.country?.names?.en ?? 'unknown';
    const region = resolved.subdivisions?.[0]?.names?.en ?? 'unknown';
    const city = resolved.city?.names?.en ?? 'unknown';

    return { countryCode, country, region, city };
  } catch (error) {
    if (env.production) {
      // console.warn(`Could not resolve IP address ${ip}: `, (error as Error)?.name);
    }
    return resolvedUnknown;
  }
}
