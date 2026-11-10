import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';
import {
  inlineCaluclationFieldSchema,
  computedInlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/inlineCalculationField.schema';

export const buffSchema = z.object({
  type: z.literal('buff'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  description: inlineCaluclationFieldSchema,
  hideRemoveButton: z.boolean().optional(),
  duration: calculationFieldSchema,
  target: z.enum(['self', 'target']).default('target'),
  silent: z.boolean().optional(),
  skipCrystalization: z.boolean().optional(),
});

export const computedBuffSchema = z.object({
  ...buffSchema.shape,
  description: computedInlineCalculationFieldSchema,
  duration: computedCalculationFieldSchema,
  durationSpent: z.number().min(0).optional(),
  appliedBy: z
    .object({
      name: z.string().max(STORAGE_LIMITS.name),
      id: z.string().max(32),
      collection: z.string().max(STORAGE_LIMITS.collectionName),
    })
    .optional(),
});

export type Buff = z.infer<typeof buffSchema>;
export type ComputedBuff = z.infer<typeof computedBuffSchema>;
