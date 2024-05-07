import { env } from '@metronome/env';

type ResolvedReferrer = {
  referrer: string | null;
  referrerDomain: string | null;
};

export function resolveReferrer(referrer: string): ResolvedReferrer {
  if (env.dev) referrer = 'https://www.google.com/';

  if (!referrer) return { referrer: null, referrerDomain: null };

  try {
    const url = new URL(referrer);
    const referrerDomain = `${url.protocol}//${url.hostname}`;

    return { referrer, referrerDomain };
  } catch (error) {
    console.warn(`Could not resolve referrer ${referrer}: `, (error as Error)?.name);
    return { referrer: null, referrerDomain: null };
  }
}
