import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { z } from 'zod';

export const tagTargetingSchema = z.object({
  targetByTags: z.literal(true),
  targetField: z.string().max(STORAGE_LIMITS.variableName).optional(),
  targetTags: z
    .array(z.string().max(STORAGE_LIMITS.variableName))
    .max(STORAGE_LIMITS.tagLength)
    .optional(),
  extraTags: z.array(
    z.object({
      _id: z.string().max(32),
      operation: z.enum(['OR', 'NOT']),
      tags: z
        .array(z.string().max(STORAGE_LIMITS.variableName))
        .max(STORAGE_LIMITS.tagLength)
        .optional(),
    }),
  ),
});

export type TagTargeting = z.infer<typeof tagTargetingSchema>;
