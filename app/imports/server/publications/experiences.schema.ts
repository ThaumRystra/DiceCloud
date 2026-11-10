import { z } from 'zod';

export const experiencesArgsSchema = z.object({
  creatureId: z.string().max(32),
});
