import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  inlineCaluclationFieldSchema,
  computedInlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/inlineCalculationField.schema';

export const noteSchema = z.object({
  type: z.literal('note'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  summary: inlineCaluclationFieldSchema,
  description: inlineCaluclationFieldSchema,
  silent: z.boolean().optional(),
});

export const computedNoteSchema = z.object({
  ...noteSchema.shape,
  summary: computedInlineCalculationFieldSchema,
  description: computedInlineCalculationFieldSchema,
});

export type Note = z.infer<typeof noteSchema>;
export type ComputedNote = z.infer<typeof computedNoteSchema>;
