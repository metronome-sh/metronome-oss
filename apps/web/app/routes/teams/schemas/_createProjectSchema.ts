import { z } from 'zod';

export type CreateProjectSchemaType = z.infer<typeof createProjectSchema>;

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3)
    .refine((value) => !['create', 'billing'].includes(value), {
      message: 'The string should not contain the words "create" or "billing"',
    }),
  url: z.union([z.string().url(), z.literal('')]),
});
