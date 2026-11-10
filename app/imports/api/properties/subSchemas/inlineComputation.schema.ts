import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { errorSchema } from '/imports/api/properties/subSchemas/error.schema';

export const inlineComputationSchema = z.object({
  // The part between bracers {}
  calculation: z.string().max(STORAGE_LIMITS.calculation),
  value: z
    .union([z.string().max(STORAGE_LIMITS.calculation), z.number()])
    .optional(),
  errors: z.array(errorSchema).max(STORAGE_LIMITS.errorCount).optional(),
});

export type InlineComputation = z.infer<typeof inlineComputationSchema>;
