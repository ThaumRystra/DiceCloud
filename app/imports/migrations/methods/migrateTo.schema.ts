import { z } from 'zod';

export const migrateToArgsSchema = z.object({
  version: z.union([z.int(), z.string()]),
});
