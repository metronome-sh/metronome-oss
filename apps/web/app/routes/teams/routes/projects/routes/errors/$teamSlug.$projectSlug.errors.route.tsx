import { projects, errors, users } from '@metronome/db';
import { ActionFunctionArgs, defer, json, LoaderFunctionArgs } from '@remix-run/node';
import { invariant } from 'ts-invariant';

import { Breadcrumb, Heading, NotificationsOutlet } from '#app/components';
import { Filters, filters } from '#app/filters';
import { handle } from '#app/handlers/handle';
import { notFound } from '#app/responses';
import { ErrorsList } from './components/ErrorsList';
import { namedAction } from '#app/utils/namedAction';

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

  await users.update(user.id, { settings: { lastErrorVisitedAt: Date.now() } });

  const projectErrors = errors.all({ project, range, status });

  return defer({ projectErrors: projectErrors });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { teamSlug = '', projectSlug = '' } = params;

  invariant(teamSlug, 'teamSlug should be defined');
  invariant(projectSlug, 'projectSlug should be defined');

  const { auth, form } = await handle(request);

  const user = await auth.user();

  const project = await projects.findBySlugs({
    teamSlug,
    projectSlug,
    userId: user.id,
  });

  if (!project) throw notFound();

  const hashes = form.getAll('hashes');

  invariant(hashes, 'hash should be defined');

  return namedAction(request, {
    async archive() {
      await errors.archive({ project, hashes });
      return json({ success: true });
    },
    async resolve() {
      await errors.resolve({ project, hashes });
      return json({ success: true });
    },
    async unresolve() {
      await errors.unresolve({ project, hashes });
      return json({ success: true });
    },
  });
}

export default function Component() {
  return (
    <div className="w-full flex-grow flex flex-col">
      <Breadcrumb>Errors</Breadcrumb>
      <div className="mx-auto w-full rounded-lg">
        <NotificationsOutlet />
        <Heading
          title="Errors"
          description="Client and server errors."
          separatorClassName="md:mb-4"
        />
      </div>
      <div className="pb-2">
        <Filters filters={[filters.dateRangeWithAll(), filters.errorStatus()]} />
      </div>
      <div className="md:px-4 flex-grow flex flex-col">
        <ErrorsList />
      </div>
    </div>
  );
}
