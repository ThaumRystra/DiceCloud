import { z } from 'zod';

export const singleCharacterArgsSchema = z.object({
  creatureId: z.string().max(32),
});
