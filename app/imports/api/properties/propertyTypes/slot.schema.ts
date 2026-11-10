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

export const slotSchema = z.object({
  type: z.literal('propertySlot'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  description: inlineCaluclationFieldSchema,
  slotType: z.string().max(STORAGE_LIMITS.variableName).optional(),
  slotTags: z
    .array(z.string().max(STORAGE_LIMITS.tagLength))
    .max(STORAGE_LIMITS.tagCount),
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
          .max(STORAGE_LIMITS.tagCount),
      }),
    )
    .max(STORAGE_LIMITS.extraTagsCount),
  quantityExpected: calculationFieldSchema,
  ignored: z.boolean().optional(),
  slotCondition: calculationFieldSchema,
  hideWhenFull: z.boolean().default(true).optional(),
  unique: z
    .enum([
      // Can't choose the same slot filler twice in this slot
      'uniqueInSlot',
      // Can't choose the same slot filler twice across the whole creature
      'uniqueInCreature',
    ])
    .default('uniqueInSlot')
    .optional(),
});

export const computedSlotSchema = z.object({
  ...slotSchema.shape,
  // Computed fields
  description: computedInlineCalculationFieldSchema,
  quantityExpected: computedCalculationFieldSchema,
  slotCondition: computedCalculationFieldSchema,
  // Denormalised fields
  totalFilled: z.int().default(0),
  spaceLeft: z.int().optional(),
});

export type Slot = z.infer<typeof slotSchema>;
export type ComputedSlot = z.infer<typeof computedSlotSchema>;
