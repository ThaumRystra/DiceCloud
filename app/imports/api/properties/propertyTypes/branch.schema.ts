import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';

export const branchSchema = z.object({
  type: z.literal('branch'),
  branchType: z
    .enum([
      'if',
      'hit',
      'miss',
      'failedSave',
      'successfulSave',
      'eachTarget',
      'random',
      'index',
      'choice',
    ])
    .default('if'),
  text: z.string().max(STORAGE_LIMITS.name).optional(),
  condition: calculationFieldSchema.meta({ parseLevel: 'compile' }),
  silent: z.boolean().optional(),
});

export const computedBranchSchema = z.object({
  ...branchSchema.shape,
  condition: computedCalculationFieldSchema.meta({ parseLevel: 'compile' }),
});

export type Branch = z.infer<typeof branchSchema>;
export type ComputedBranch = z.infer<typeof computedBranchSchema>;
