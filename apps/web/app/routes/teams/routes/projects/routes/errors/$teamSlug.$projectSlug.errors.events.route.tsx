import { projects, errors, users } from '@metronome/db';
import { LoaderFunctionArgs } from '@remix-run/node';
import { invariant } from 'ts-invariant';
import { filters } from '#app/filters';
import { handle } from '#app/handlers/handle';
import { notFound, stream } from '#app/responses';
import { type loader as errorsLoader } from './$teamSlug.$projectSlug.errors.route';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { teamSlug = '', projectSlug = '' } = params;

  invariant(teamSlug, 'teamSlug should be defined');
  invariant(projectSlug, 'projectSlug should be defined');

  const { auth, query } = await handle(request);

  const user = await auth.user();

  const project = await projects.findBySlugs({
    teamSlug,
    projectSlug,
    userId: user.id,
  });

  if (!project) throw notFound();

  const { range, status } = await query.filters({
    range: filters.dateRangeWithAll(),
    status: filters.errorStatus(),
  });

  return stream<typeof errorsLoader>('$teamSlug.$projectSlug.errors', request, async (send) => {
    const cleanupProjectErrors = await errors.watch(project, async ({ ts }) => {
      await users.update(user.id, { settings: { lastErrorVisitedAt: Date.now() } });
      const projectErrors = await errors.all({ project, range, status });
      send({ projectErrors }, ts);
    });

    return async function cleanup() {
      await cleanupProjectErrors();
    };
  });
}
