import { errors, projects } from '@metronome/db';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { invariant } from 'ts-invariant';

import { handle } from '#app/handlers/handle';
import { notFound, stream } from '#app/responses';
import { checkForProjectClientUpdates } from '#app/utils';

import { type loader as teamSlugProjectSlugLoader } from './$teamSlug.$projectSlug.route';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { auth } = await handle(request);

  const user = await auth.user();

  const { teamSlug = '', projectSlug = '' } = params;

  const project = await projects.findBySlugs({
    teamSlug,
    projectSlug,
    userId: user.id,
  });

  if (!project) throw notFound();

  return stream<typeof teamSlugProjectSlugLoader>(
    '$teamSlug.$projectSlug',
    request,
    async (send) => {
      // const cleanupProjectSemVer = await projects.watch(project, async ({ ts }) => {
      //   const updatedProject = await projects.find(project.id);

      //   invariant(updatedProject, `Cannot find project with id ${project.id}`);

      //   const semver = await checkForProjectClientUpdates(updatedProject.clientVersion ?? '0.0.0');

      //   send({ semver }, ts);
      // });

      // const cleanupError = await errors.watch(project, async ({ ts }) => {
      //   const pathname = new URL(request.url).searchParams.get('__pathname__') ?? '';

      //   if (pathname.endsWith('errors')) return;

      //   const unseenErrorsCount = await errors.unseenErrorsCount({ project, user });
      //   send({ unseenErrorsCount }, ts);
      // });

      return async function cleanup() {
        await Promise.all([
          // cleanupProjectSemVer(),
          // cleanupError()
        ]);
      };
    },
  );
}
