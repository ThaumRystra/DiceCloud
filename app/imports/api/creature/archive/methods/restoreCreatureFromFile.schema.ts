import { z } from 'zod';

export const restoreCreatureFromFileArgsSchema = z.object({
  fileId: z.string().max(32),
});
