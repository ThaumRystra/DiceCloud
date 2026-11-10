import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';

export const savingThrowSchema = z.object({
  type: z.literal('savingThrow'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  // The computed DC
  dc: calculationFieldSchema,
  // Who this saving throw applies to
  target: z.enum(['self', 'target']).default('target'),
  // The variable name of save to roll
  stat: z.string().max(STORAGE_LIMITS.variableName).optional(),
  // Prevent the property from showing up in the log
  silent: z.boolean().optional(),
});

export const computedSavingThrowSchema = z.object({
  ...savingThrowSchema.shape,
  dc: computedCalculationFieldSchema.meta({ parseLevel: 'compile' }),
});

export type SavingThrow = z.infer<typeof savingThrowSchema>;
export type ComputedSavingThrow = z.infer<typeof computedSavingThrowSchema>;
