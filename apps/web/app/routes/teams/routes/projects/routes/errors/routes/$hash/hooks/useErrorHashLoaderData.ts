import { SerializeFrom } from '@remix-run/node';
import { useRouteLoaderData } from '@remix-run/react';
import { invariant } from 'ts-invariant';

import { type loader } from '../$teamSlug.$projectSlug.errors_.$hash.route';

const routeId = '$teamSlug.$projectSlug.errors_.$hash';

export function useErrorHashLoaderData(): SerializeFrom<typeof loader> {
  const data = useRouteLoaderData<typeof loader>(routeId);
  invariant(data, `Route loader data for route ${routeId} is undefined.`);
  return data;
}
