import { handle } from '@metronome/utils.server';
import { type LoaderFunctionArgs, redirect } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const { auth } = await handle(request);

  const user = await auth.user();

  const team = user.usersToTeams.at(0);

  if (!team) {
    throw new Error('Unable to find the team associated with the user');
  }

  return redirect(`/${team.team.slug}`);
}
