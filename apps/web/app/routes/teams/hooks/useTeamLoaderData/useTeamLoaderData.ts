import { SerializeFrom } from '@remix-run/node';
import { useRouteLoaderData } from '@remix-run/react';
import { invariant } from 'ts-invariant';

import { type loader } from '../../$teamSlug.route';

export function useTeamLoaderData(): SerializeFrom<typeof loader> {
  const id = '$teamSlug';
  const data = useRouteLoaderData<typeof loader>(id);
  invariant(data, `Route loader data for route ${id} is undefined.`);
  return data;
}
