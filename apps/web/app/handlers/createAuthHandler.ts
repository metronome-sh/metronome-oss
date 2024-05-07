import { type User } from '@metronome/db';
import { users } from '@metronome/db';
import { redirect } from '@remix-run/node';
import { Authenticator, Strategy } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { z } from 'zod';

import { createFormHandler } from './createFormHandler';
import { createSessionHandler } from './createSessionHandler';

export const AuthFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function createAuthHandler({
  request,
  session,
  form,
  strategies,
}: {
  request: Request;
  session: ReturnType<typeof createSessionHandler>;
  form: Awaited<ReturnType<typeof createFormHandler>>;
  strategies?: Record<string, Strategy<User, never>>;
}) {
  const authenticator = new Authenticator<User>(session.storage());

  Object.entries(strategies || {}).forEach(([name, strategy]) => {
    authenticator.use(strategy, name);
  });

  // Default user/pass strategy
  authenticator.use(
    new FormStrategy(async () => {
      const { email, password } = await form.validate(AuthFormSchema);

      const user = await users.authenticate({ email, password });

      if (!user) throw new Error('Invalid credentials');

      return user;
    }),
    'form',
  );

  async function user(options: { required: false }): Promise<User | null>;
  async function user(options?: { required?: boolean }): Promise<User>;
  async function user(options?: { required?: boolean }): Promise<User | null> {
    const { id = null } = (await authenticator.isAuthenticated(request)) || {};

    if (options?.required !== false && !id) {
      throw redirect('/authentication/grant');
    } else if (!id) {
      return null;
    }

    const userObject = await users.findFirst({ id });

    if (!userObject) {
      throw redirect('/authentication/grant', {
        headers: { 'Set-Cookie': await session.destroy() },
      });
    }

    return userObject;
  }

  async function attempt(strategy: string, options?: { success?: string; failure?: string }) {
    await authenticator.authenticate(strategy, request, {
      successRedirect: options?.success,
      failureRedirect: options?.failure,
      throwOnError: true,
    });
  }

  async function logout({ redirectTo }: { redirectTo: string }) {
    return authenticator.logout(request, { redirectTo });
  }

  async function error() {
    return session.get<Record<string, string>>(authenticator.sessionErrorKey);
  }

  return { user, attempt, logout, error };
}
