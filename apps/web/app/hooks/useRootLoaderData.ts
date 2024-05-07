import { SerializeFrom } from '@remix-run/node';
import { useRouteLoaderData } from '@remix-run/react';
import { invariant } from 'ts-invariant';

import { type loader } from '../root';

export function useRootLoaderData(): SerializeFrom<typeof loader> {
  const data = useRouteLoaderData<typeof loader>('root');
  invariant(data, `Route loader data for route root is undefined.`);
  return data;
}
