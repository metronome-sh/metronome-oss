import { users } from '@metronome/db';
import { LoaderFunctionArgs, type MetaFunction, redirect } from '@remix-run/node';

import { handle } from '#app/handlers/handle';

export const meta: MetaFunction = () => {
  return [{ title: 'Metronome' }, { name: 'description', content: 'Remix Analytics' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { auth } = await handle(request);

  const user = await auth.user({ required: false });

  if (user) {
    throw redirect('/authentication/success');
  }

  if (!(await users.atLeastOneExists())) {
    throw redirect('/authentication/create');
  }

  throw redirect('/authentication/grant');
}

export default function Component() {
  return null;
}
