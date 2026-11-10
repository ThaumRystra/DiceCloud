import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import { errorSchema } from '/imports/api/properties/subSchemas/error.schema';

export const constantSchema = z.object({
  type: z.literal('constant'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  variableName: z
    .string()
    .min(2)
    .max(STORAGE_LIMITS.variableName)
    .regex(VARIABLE_NAME_REGEX)
    .default('newConstant'),
  calculation: z.string().max(STORAGE_LIMITS.calculation).optional(),
  errors: z.array(errorSchema).max(STORAGE_LIMITS.errorCount).optional(),
});

export const computedConstantSchema = z.object({
  ...constantSchema.shape,
});

export type Constant = z.infer<typeof constantSchema>;
export type ComputedConstant = z.infer<typeof computedConstantSchema>;
