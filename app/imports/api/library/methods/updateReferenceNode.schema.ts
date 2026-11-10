import { z } from 'zod';

export const updateReferenceNodeArgsSchema = z.object({
  _id: z.string().max(32),
});
