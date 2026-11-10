import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  inlineCaluclationFieldSchema,
  computedInlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/inlineCalculationField.schema';

export const itemSchema = z.object({
  type: z.literal('item'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  plural: z.string().max(STORAGE_LIMITS.name).optional(),
  description: inlineCaluclationFieldSchema,
  quantity: z.int().min(0).default(1),
  weight: z.number().min(0).optional(),
  value: z.number().min(0).optional(),
  requiresAttunement: z.boolean().optional(),
  attuned: z.boolean().optional(),
  showIncrement: z.boolean().optional(),
  equipped: z.boolean().default(false),
  silent: z.boolean().optional(),
  ammoTriggerIds: z
    .object({
      before: z.array(z.string().max(32)).optional(),
      after: z.array(z.string().max(32)).optional(),
      afterChildren: z.array(z.string().max(32)).optional(),
    })
    .optional(),
});

export const computedItemSchema = z.object({
  ...itemSchema.shape,
  description: computedInlineCalculationFieldSchema,
});

export type Item = z.infer<typeof itemSchema>;
export type ComputedItem = z.infer<typeof computedItemSchema>;
