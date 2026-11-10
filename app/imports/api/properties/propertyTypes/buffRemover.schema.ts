import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

export const buffRemoverSchema = z.object({
  type: z.literal('buffRemover'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  targetParentBuff: z.boolean().optional(),
  target: z.enum(['self', 'target']).default('target'),
  removeAll: z.boolean().default(true),
  targetTags: z
    .array(z.string().max(STORAGE_LIMITS.tagLength))
    .max(STORAGE_LIMITS.tagCount)
    .optional(),
  extraTags: z
    .array(
      z.object({
        _id: z.string().default(() => Random.id()),
        operation: z.enum(['OR', 'NOT']).default('OR'),
        tags: z
          .array(z.string().max(STORAGE_LIMITS.tagLength))
          .max(STORAGE_LIMITS.tagCount)
          .default([]),
      }),
    )
    .max(STORAGE_LIMITS.extraTagsCount)
    .optional(),
  silent: z.boolean().optional(),
});

export const computedBuffRemoverSchema = z.object({
  ...buffRemoverSchema.shape,
});

export type BuffRemover = z.infer<typeof buffRemoverSchema>;
export type ComputedBuffRemover = z.infer<typeof computedBuffRemoverSchema>;
