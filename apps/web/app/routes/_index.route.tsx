import { json, type MetaFunction } from '@remix-run/node';
import AuthenticationGrantComponent from './authentication/authentication.grant.route';
import AuthenticationCreateComponent from './authentication/authentication.create.route';

import { useLoaderData } from '@remix-run/react';
import { users } from '@metronome/db.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Metronome' },
    { name: 'description', content: 'Remix Analytics' },
  ];
};

export async function loader() {
  const atLeastOneUserExists = await users.atLeastOneExists();

  console.log({ atLeastOneUserExists });

  return json({ atLeastOneUserExists });
}

export default function Component() {
  const { atLeastOneUserExists } = useLoaderData<typeof loader>();

  return atLeastOneUserExists ? (
    <AuthenticationGrantComponent />
  ) : (
    <AuthenticationCreateComponent />
  );
}
