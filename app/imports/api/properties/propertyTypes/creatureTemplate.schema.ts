import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  inlineCaluclationFieldSchema,
  computedInlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/inlineCalculationField.schema';

export const creatureTemplateSchema = z.object({
  type: z.literal('creature'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  description: inlineCaluclationFieldSchema,
  picture: z.string().max(STORAGE_LIMITS.url).optional(),
  avatarPicture: z.string().max(STORAGE_LIMITS.url).optional(),
  silent: z.boolean().optional(),
});

export const computedCreatureTemplateSchema = z.object({
  ...creatureTemplateSchema.shape,
  description: computedInlineCalculationFieldSchema,
});

export type CreatureTemplate = z.infer<typeof creatureTemplateSchema>;
export type ComputedCreatureTemplate = z.infer<
  typeof computedCreatureTemplateSchema
>;
