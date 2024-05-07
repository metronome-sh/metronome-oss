import { Temporal } from '@js-temporal/polyfill';
import { projects, usages } from '@metronome/db';
import { type LoaderFunctionArgs } from '@remix-run/node';

import { handle } from '#app/handlers/handle';
import { notFound, stream } from '#app/responses';

import { type loader as settingsLoader } from './$teamSlug.$projectSlug.settings.route';

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

  // TODO get the billing cycle instead of the month
  const range = {
    from: Temporal.Now.instant()
      .toZonedDateTimeISO('UTC')
      .withPlainTime('00:00:00')
      .add({
        days: -(Temporal.Now.instant().toZonedDateTimeISO('UTC').day - 1),
      }),
    to: Temporal.Now.instant().toZonedDateTimeISO('UTC').withPlainTime('23:59:59'),
  };

  return stream<typeof settingsLoader>('$teamSlug.$projectSlug.settings', request, async (send) => {
    const cleanupProjectUsage = await usages.watch({ project }, async ({ ts }) => {
      const usage = await usages.projectUsage({ project, range });
      send({ usage }, ts);
    });

    return async function cleanup() {
      await cleanupProjectUsage();
    };
  });
}
