import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';

export const damageMultiplierSchema = z.object({
  type: z.literal('damageMultiplier'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  damageTypes: z
    .array(
      z.string().max(STORAGE_LIMITS.calculation).regex(VARIABLE_NAME_REGEX),
    )
    .max(STORAGE_LIMITS.damageTypeCount)
    .default([]),
  value: z.union([z.literal(0), z.literal(0.5), z.literal(2)]).default(0.5),
  excludeTags: z
    .array(z.string().max(STORAGE_LIMITS.tagLength))
    .max(STORAGE_LIMITS.tagCount)
    .default([]),
  includeTags: z
    .array(z.string().max(STORAGE_LIMITS.tagLength))
    .max(STORAGE_LIMITS.tagCount)
    .default([]),
});

export const computedDamageMultiplierSchema = z.object({
  ...damageMultiplierSchema.shape,
});

export type DamageMultiplier = z.infer<typeof damageMultiplierSchema>;
export type ComputedDamageMultiplier = z.infer<
  typeof computedDamageMultiplierSchema
>;
