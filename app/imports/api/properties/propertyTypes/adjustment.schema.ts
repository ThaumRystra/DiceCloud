import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';

export const adjustmentSchema = z.object({
  type: z.literal('adjustment'),
  amount: calculationFieldSchema.meta({ parseLevel: 'compile' }),
  target: z.enum(['self', 'target']).default('target'),
  stat: z.string().max(STORAGE_LIMITS.variableName).optional(),
  operation: z.enum(['set', 'increment']).default('increment'),
  silent: z.boolean().optional(),
});

export const computedAdjustmentSchema = z.object({
  ...adjustmentSchema.shape,
  amount: computedCalculationFieldSchema.meta({ parseLevel: 'compile' }),
});

export type Adjustment = z.infer<typeof adjustmentSchema>;
export type ComputedAdjustment = z.infer<typeof computedAdjustmentSchema>;
