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

export const classSchema = z.object({
  type: z.literal('class'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  description: inlineCaluclationFieldSchema,
  variableName: z.string().max(STORAGE_LIMITS.variableName).optional(),
  slotTags: z
    .array(z.string().max(STORAGE_LIMITS.tagLength))
    .max(STORAGE_LIMITS.tagCount)
    .default([]),
  extraTags: z
    .array(
      z.object({
        _id: z
          .string()
          .max(32)
          .default(() => Random.id()),
        operation: z.enum(['OR', 'NOT']).default('OR'),
        tags: z
          .array(z.string().max(STORAGE_LIMITS.tagLength))
          .max(STORAGE_LIMITS.tagCount)
          .default([]),
      }),
    )
    .max(STORAGE_LIMITS.extraTagsCount)
    .default([]),
  slotCondition: calculationFieldSchema,
});

export const computedClassSchema = z.object({
  ...classSchema.shape,
  description: computedInlineCalculationFieldSchema,
  slotCondition: computedCalculationFieldSchema,
  level: z.int().optional(),
  missingLevels: z.array(z.int()).optional(),
});

export type Class = z.infer<typeof classSchema>;
export type ComputedClass = z.infer<typeof computedClassSchema>;
