import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import {
  inlineCaluclationFieldSchema,
  computedInlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/inlineCalculationField.schema';

export const classLevelSchema = z.object({
  type: z.literal('classLevel'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  description: inlineCaluclationFieldSchema,
  variableName: z
    .string()
    .min(2)
    .max(STORAGE_LIMITS.variableName)
    .regex(VARIABLE_NAME_REGEX)
    .optional(),
  level: z.int().max(STORAGE_LIMITS.levelMax).default(1),
});

export const computedClassLevelSchema = z.object({
  ...classLevelSchema.shape,
  description: computedInlineCalculationFieldSchema,
});

export type ClassLevel = z.infer<typeof classLevelSchema>;
export type ComputedClassLevel = z.infer<typeof computedClassLevelSchema>;
