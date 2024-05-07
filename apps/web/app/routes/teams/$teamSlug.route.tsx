import { projects, teams, users } from '@metronome/db';
import { json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

import { Container } from '#app/components';
import { handle } from '#app/handlers/handle';
import { notFound } from '#app/responses';

import { TeamsHeader } from './components';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { auth } = await handle(request);

  const user = await auth.user();

  const { teamSlug = '' } = params;

  const team = await teams.findBySlug({ teamSlug, userId: user.id });

  if (!team) throw notFound();

  if (user.settings?.lastSelectedTeamSlug !== team.slug) {
    await users.lastSelectedTeamSlug({ teamSlug: team.slug!, userId: user.id });
  }

  const pathname = new URL(request.url).pathname;

  const teamProjects = await projects.findByTeamId({ teamId: team.id });

  if (typeof teamSlug === 'string' && pathname.endsWith(teamSlug)) {
    const lastSelectedProjectSlug = user.settings?.lastSelectedProjectSlug;

    if (typeof lastSelectedProjectSlug === 'string' && lastSelectedProjectSlug !== '') {
      throw redirect(`/${teamSlug}/${lastSelectedProjectSlug}/overview`);
    }

    if (teamProjects.length === 0) throw redirect(`/${teamSlug}/create`);

    throw redirect(`/${teamSlug}/${teamProjects.at(0)!.slug}/overview`);
  }

  return json({
    team,
    projects: teamProjects,
    lastSelectedProjectSlug: user.settings?.lastSelectedProjectSlug,
  });
}

export default function Component() {
  return (
    <Container>
      <TeamsHeader />
      <Outlet />
    </Container>
  );
}
