import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';

export const damageSchema = z.object({
  type: z.literal('damage'),
  amount: calculationFieldSchema.meta({ parseLevel: 'compile' }),
  target: z.enum(['self', 'target']).default('target'),
  damageType: z
    .string()
    .max(STORAGE_LIMITS.calculation)
    .regex(VARIABLE_NAME_REGEX)
    .default('slashing'),
  silent: z.boolean().optional(),
  save: z
    .object({
      dc: calculationFieldSchema,
      stat: z.string().max(STORAGE_LIMITS.variableName).optional(),
      damageFunction: calculationFieldSchema.meta({ parseLevel: 'compile' }),
    })
    .optional(),
});

export const computedDamageSchema = z.object({
  ...damageSchema.shape,
  amount: computedCalculationFieldSchema.meta({ parseLevel: 'compile' }),
  save: z
    .object({
      dc: computedCalculationFieldSchema.meta({ parseLevel: 'compile' }),
      stat: z.string().max(STORAGE_LIMITS.variableName).optional(),
      damageFunction: computedCalculationFieldSchema.meta({
        parseLevel: 'compile',
      }),
    })
    .optional(),
});

export type Damage = z.infer<typeof damageSchema>;
export type ComputedDamage = z.infer<typeof computedDamageSchema>;
