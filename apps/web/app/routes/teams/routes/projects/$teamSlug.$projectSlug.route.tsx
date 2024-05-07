import { errors, projects, users } from '@metronome/db';
import { defer, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';

import { Breadcrumb } from '#app/components';
import { handle } from '#app/handlers/handle';
import { notFound } from '#app/responses';
import { checkForProjectClientUpdates } from '#app/utils';

import { ProjectSelector } from '../../components';
import { Navigation, VersionNotification } from './components';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { teamSlug = '', projectSlug = '' } = params;

  const pathname = new URL(request.url).pathname;

  if (typeof projectSlug === 'string' && pathname.endsWith(projectSlug)) {
    throw redirect(`/${teamSlug}/${projectSlug}/overview`);
  }

  const { auth } = await handle(request);

  const user = await auth.user();

  const project = await projects.findBySlugs({
    teamSlug,
    projectSlug,
    userId: user.id,
  });

  if (!project) throw notFound();

  if (user.settings?.lastSelectedProjectSlug !== project.slug) {
    await users.lastSelectedProjectSlug({ projectSlug, userId: user.id });
  }

  const semver = checkForProjectClientUpdates(project.clientVersion || '0.0.0');

  const unseenErrorsCount = errors.unseenErrorsCount({ project, user });

  return defer({ project, semver, unseenErrorsCount });
}

export default function Component() {
  return (
    <div className="flex flex-col flex-grow">
      <Breadcrumb>
        <ProjectSelector />
      </Breadcrumb>
      <Navigation />
      <VersionNotification />
      <div className="mx-auto w-full h-full flex-grow flex flex-col max-w-screen-xl px-4">
        <Outlet />
      </div>
    </div>
  );
}
