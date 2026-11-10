import { z } from 'zod';

export const removeCreatureArgsSchema = z.object({
  charId: z.string().max(32),
});
