import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  inlineCaluclationFieldSchema,
  computedInlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/inlineCalculationField.schema';

export const featureSchema = z.object({
  type: z.literal('feature'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  summary: inlineCaluclationFieldSchema,
  description: inlineCaluclationFieldSchema,
});

export const computedFeatureSchema = z.object({
  ...featureSchema.shape,
  summary: computedInlineCalculationFieldSchema,
  description: computedInlineCalculationFieldSchema,
});

export type Feature = z.infer<typeof featureSchema>;
export type ComputedFeature = z.infer<typeof computedFeatureSchema>;
