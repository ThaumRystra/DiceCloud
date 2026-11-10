import { z } from 'zod';

export const softRemovableSchema = z.object({
  removed: z.boolean().optional(),
  removedAt: z.date().optional(),
  removedWith: z.string().max(32).optional(),
});

export type SoftRemovable = z.infer<typeof softRemovableSchema>;
