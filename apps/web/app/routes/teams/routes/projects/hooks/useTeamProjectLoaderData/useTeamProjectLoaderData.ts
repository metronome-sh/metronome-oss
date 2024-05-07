import { SerializeFrom } from '@remix-run/node';
import { useRouteLoaderData } from '@remix-run/react';
import { invariant } from 'ts-invariant';

import { loader } from '../../$teamSlug.$projectSlug.route';

export function useTeamProjectLoaderData(): SerializeFrom<typeof loader> {
  const id = '$teamSlug.$projectSlug';
  const data = useRouteLoaderData<typeof loader>(id);
  invariant(data, `Route loader data for route ${id} is undefined.`);
  return data;
}
