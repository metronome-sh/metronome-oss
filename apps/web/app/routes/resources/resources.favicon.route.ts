import { type LoaderFunctionArgs } from '@remix-run/node';
import faviconThief from 'favicon-thief';
import * as mime from 'mime-types';

import { handle } from '#app/handlers/handle';
import { notFound } from '#app/responses';

const { getFavicons } = faviconThief;

const cache = new Map<string, string>();

export async function loader({ request }: LoaderFunctionArgs) {
  const { query } = await handle(request);

  let url = await query.get('url');

  if (!url || url?.includes('localhost')) return notFound();

  if (url?.endsWith('/')) url = url.slice(0, -1);

  let faviconUrl = cache.get(url);

  if (!faviconUrl) {
    const favicons = await getFavicons(url);

    if (favicons.length === 0) return notFound();

    faviconUrl = favicons[0].url;

    cache.set(url, faviconUrl);
  }

  const response = await fetch(faviconUrl);

  if (!response.ok) return notFound();

  const extension = faviconUrl.split('.').pop() ?? '';

  return new Response(response.body, {
    // Cache it for a month
    headers: {
      'Cache-Control': 'public, max-age=2592000',
      'Content-Type': mime.lookup(extension) || 'image/*',
    },
  });
}
