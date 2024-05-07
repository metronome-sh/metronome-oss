import Slugify from 'slugify';

Slugify.extend({ '.': '-' });

export function slugify(text: string): string {
  return Slugify(text, { lower: true, strict: true, locale: 'en' });
}
