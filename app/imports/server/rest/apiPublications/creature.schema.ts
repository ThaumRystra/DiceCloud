import { z } from 'zod';

export const creatureIdArgsSchema = z.object({
  creatureId: z.string().max(32),
});
