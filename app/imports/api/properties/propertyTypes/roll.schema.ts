import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';

export const rollSchema = z.object({
  type: z.literal('roll'),
  name: z.string().max(STORAGE_LIMITS.name).default('New Roll'),
  // The technical, lowercase, single-word name used in formulae
  variableName: z
    .string()
    .min(2)
    .max(STORAGE_LIMITS.variableName)
    .regex(VARIABLE_NAME_REGEX)
    .default('newRoll'),
  // The roll, can be simplified, but only computed in context
  roll: calculationFieldSchema.meta({ parseLevel: 'compile' }),
  // Prevent the roll from showing up in the log
  silent: z.boolean().optional(),
});

export const computedRollSchema = z.object({
  ...rollSchema.shape,
  roll: computedCalculationFieldSchema.meta({ parseLevel: 'compile' }),
});

export type Roll = z.infer<typeof rollSchema>;
export type ComputedRoll = z.infer<typeof computedRollSchema>;
