import { ioredis, ioredisUnique } from './modules/ioredis';
import { redlock, Lock } from './modules/redlock';
import { env } from '@metronome/env';

// eslint-disable-next-line @typescript-eslint/ban-types
type OtherString = string & {};
type Key = 'session' | OtherString;

let cacheRememberWarningLogged = false;

const PREFIX = 'metronome_cache:';

function createSetFunction(connection: typeof ioredis) {
  return async function set<Data>(key: Key | Key[], value: Data, seconds?: number) {
    const stringifiedKey = PREFIX + JSON.stringify(key);
    const stringifiedValue = JSON.stringify(value);

    if (seconds) {
      await connection.set(stringifiedKey, stringifiedValue, 'EX', seconds);
    } else {
      await connection.set(stringifiedKey, stringifiedValue);
    }

    return value;
  };
}

function createGetFunction(connection: typeof ioredis) {
  return async function get<Data>(key: Key | Key[]) {
    const stringifiedKey = PREFIX + JSON.stringify(key);
    const value = await connection.get(stringifiedKey);
    return value ? (JSON.parse(value) as Data) : null;
  };
}

function createRememberFunction(connection: typeof ioredis) {
  return async function remember<Data>(
    key: Key | Key[],
    callback: () => Promise<Data> | Data,
    seconds: number,
  ) {
    const stringifiedKey = PREFIX + JSON.stringify(key);

    const value = await connection.get(stringifiedKey);

    if (value && !env.dev) return JSON.parse(value) as Data;

    if (env.dev && !cacheRememberWarningLogged) {
      console.warn('cache.remember will always miss in development');
      cacheRememberWarningLogged = true;
    }

    const newValue = await callback();

    if (newValue !== null || newValue !== undefined) {
      await connection.set(stringifiedKey, JSON.stringify(await callback()), 'EX', seconds);
    }

    return newValue as Data;
  };
}

function createForgetFunction(connection: typeof ioredis) {
  return async function forget<T extends Key>(key: T | T[]) {
    const stringifiedKey = PREFIX + JSON.stringify(key);
    await connection.del(stringifiedKey);
  };
}

function lock<T extends Key>(keys: T[], time = 5000): Promise<Lock> {
  return redlock.acquire([JSON.stringify(keys)], time);
}

function createInstance(connection: typeof ioredis) {
  return {
    set: createSetFunction(connection),
    get: createGetFunction(connection),
    remember: createRememberFunction(connection),
    forget: createForgetFunction(connection),
    lock,
  };
}

export const cache = Object.assign(createInstance(ioredis), {
  unique: createInstance(ioredisUnique),
});
