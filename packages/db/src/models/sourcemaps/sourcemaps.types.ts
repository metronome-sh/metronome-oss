import { type NullableMappedPosition } from 'source-map';
import { CamelCasedProperties } from 'type-fest';

export interface ClickHouseSourcemap {
  project_id: string;
  version: string;
  path: string;
  deleted: number;
  created_at: Date;
  updated_at: Date;
}

export type Sourcemap = CamelCasedProperties<ClickHouseSourcemap>;

export type StackTraceSource = {
  code: string | null;
  at: string | null;
  filename: string | null;
  entries: { lineNumber: number | null; column: number | null }[];
  source: string | null;
};
