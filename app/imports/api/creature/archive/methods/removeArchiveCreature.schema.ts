import { z } from 'zod';

export const removeArchiveCreatureArgsSchema = z.object({
  fileId: z.string().max(32),
});
