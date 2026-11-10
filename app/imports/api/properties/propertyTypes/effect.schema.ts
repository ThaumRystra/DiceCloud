import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';
import { tagTargetingSchema } from '/imports/api/properties/subSchemas/tagTargeting.schema';

export const effectSchema = z.object({
  type: z.literal('effect'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  operation: z
    .enum([
      'base',
      'add',
      'mul',
      'min',
      'max',
      'set',
      'advantage',
      'disadvantage',
      'passiveAdd',
      'fail',
      'conditional',
    ])
    .default('add'),
  amount: calculationFieldSchema,
  text: z.string().max(STORAGE_LIMITS.effectText).optional(),
  stats: z
    .array(z.string().max(STORAGE_LIMITS.variableName))
    .max(STORAGE_LIMITS.statsToTarget)
    .default([]),
  ...tagTargetingSchema.shape,
});

export const computedEffectSchema = z.object({
  ...effectSchema.shape,
  amount: computedCalculationFieldSchema,
});

export type Effect = z.infer<typeof effectSchema>;
export type ComputedEffect = z.infer<typeof computedEffectSchema>;
