import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { tagTargetingSchema } from '/imports/api/properties/subSchemas/tagTargeting.schema';

export const proficiencySchema = z.object({
  type: z.literal('proficiency'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  // The variableNames of the skills, tags, or attributes to apply proficiency to
  stats: z
    .array(z.string().max(STORAGE_LIMITS.variableName))
    .max(STORAGE_LIMITS.statsToTarget),
  // A number representing how proficient the character is
  // where 0.49 is half rounded down and 0.5 is half rounded up
  value: z
    .union([z.literal(0.49), z.literal(0.5), z.literal(1), z.literal(2)])
    .default(1),
  ...tagTargetingSchema.shape,
});

export const computedProficiencySchema = z.object({
  ...proficiencySchema.shape,
});

export type Proficiency = z.infer<typeof proficiencySchema>;
export type ComputedProficiency = z.infer<typeof computedProficiencySchema>;
