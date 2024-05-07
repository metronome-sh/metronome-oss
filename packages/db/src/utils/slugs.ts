import { eq, sql } from 'drizzle-orm';

import { db } from '../db';
import { nanoid } from '../modules/nanoid';
import { slugify } from '../modules/slugify';
import { projects, teams } from '../schema';

const reservedWords = [
  'create',
  'billing',
  'shared',
  'demo',
  'docs',
  'events',
  'resources',
  'healtcheck',
  'insights',
  'authentication',
  'stripe',
  'metrics',
  'notifications',
];

export async function generateSlug({
  text,
  table,
}: {
  text: string;
  table: typeof teams | typeof projects;
}) {
  let slug = '';
  let tries = 0;
  let textToSlugify = text;

  if (reservedWords.includes(text)) {
    textToSlugify = `${text}-${nanoid.lower(4)}`;
  }

  while (!slug && tries < 100) {
    const candidate = slugify(textToSlugify) + (tries ? `-${nanoid.lower(4)}` : '');
    const [existing] = await db()
      .select({ count: sql<number>`count(*)::integer` })
      .from(table)
      .where(eq(table.slug, candidate))
      .limit(1);

    if (existing.count === 0) {
      slug = candidate;
      break;
    }

    tries++;
  }

  // just move on if we can't find a slug after 100 tries
  if (!slug) slug = nanoid.lower(10);

  return slug;
}
