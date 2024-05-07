import { sql } from 'drizzle-orm';

export function buildJsonbObject(record: Record<string, unknown> | null | undefined) {
  if (!record || Object.keys(record).length === 0) {
    return sql.raw(`'{}'::jsonb`);
  }

  return sql.raw(`'${JSON.stringify(record)}'::jsonb`);
}
