import { z } from 'zod';

export const LegacysPanSchema = z.object({
  id: z.string(),
  name: z.string(),
  traceId: z.string(),
  parentSpanId: z.string().nullable(),
  attributes: z.any(),
  events: z.array(z.any()),
  timestamp: z.number(),
  startNano: z.string(),
  endNano: z.string(),
  durationNano: z.string(),
  status: z.string(),
});

export type LegacySpan = z.infer<typeof LegacysPanSchema>;
