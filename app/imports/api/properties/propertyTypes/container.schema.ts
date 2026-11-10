import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  inlineCaluclationFieldSchema,
  computedInlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/inlineCalculationField.schema';

export const containerSchema = z.object({
  type: z.literal('container'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  carried: z.boolean().default(true),
  contentsWeightless: z.boolean().optional(),
  weight: z.number().min(0).optional(),
  value: z.number().min(0).optional(),
  description: inlineCaluclationFieldSchema,
});

export const computedContainerSchema = z.object({
  ...containerSchema.shape,
  description: computedInlineCalculationFieldSchema,
  contentsWeight: z.number().optional(),
  carriedWeight: z.number().optional(),
  contentsValue: z.number().optional(),
  carriedValue: z.number().optional(),
});

export type Container = z.infer<typeof containerSchema>;
export type ComputedContainer = z.infer<typeof computedContainerSchema>;
