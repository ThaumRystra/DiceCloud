import { z } from 'zod';

export const archiveCreatureToFileArgsSchema = z.object({
  creatureId: z.string().max(32),
});
