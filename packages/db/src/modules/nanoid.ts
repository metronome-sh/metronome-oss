import { customAlphabet } from 'nanoid';

// prettier-ignore
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const lowerCaseAlphabet = 'abcdefghijklmnopqrstuvwxyz';

const prefixes = {
  user: 'usr',
  team: 'tm',
  project: 'prj',
  apiKey: 'ak',
} as const;

type Key = keyof typeof prefixes;
type Prefix = (typeof prefixes)[Key];

const instance = customAlphabet(alphabet, 10);

/**
 * Generate a random lowercase string of length 10.
 */
const lower = customAlphabet(lowerCaseAlphabet, 10);

/**
 * Generates a unique ID for a given key.
 * @param key
 * @param size
 * @returns string
 */
function id(key: Key, size = 10): `${Prefix}_${string}` {
  const prefix = prefixes[key];
  return `${prefix}_${instance(size)}`;
}

export const nanoid = Object.assign(customAlphabet(alphabet, 10), {
  lower,
  id,
});
