import { type User } from '@metronome/db';
import { type Strategy } from 'remix-auth';

import { createAuthHandler } from './createAuthHandler';
import { createFormHandler } from './createFormHandler';
import { createQueryHandler } from './createQueryHandler';
import { createSessionHandler } from './createSessionHandler';

export function createHandler(options?: {
  auth?: {
    strategies: Record<string, Strategy<User, never>>;
  };
}) {
  return async function handle(request: Request) {
    const session = createSessionHandler({ request });
    const form = await createFormHandler({ request });
    const auth = await createAuthHandler({
      request,
      session,
      form,
      strategies: options?.auth?.strategies,
    });

    const query = await createQueryHandler({ request });

    const search = new URL(request.url).searchParams;

    return { form, auth, session, query, search };
  };
}
