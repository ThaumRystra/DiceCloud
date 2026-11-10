import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';
import { tagTargetingSchema } from '/imports/api/properties/subSchemas/tagTargeting.schema';

export const toggleSchema = z.object({
  type: z.literal('toggle'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  variableName: z.string().max(STORAGE_LIMITS.variableName).optional(),
  showUI: z.boolean().optional(),
  disabled: z.boolean().optional(),
  enabled: z.boolean().optional(),
  // if neither disabled or enabled, the condition will be run to determine
  // if the children of the toggle should be active
  condition: calculationFieldSchema,
  // Prevent the property from showing up in the log
  silent: z.boolean().optional(),
  ...tagTargetingSchema.shape,
});

export const computedToggleSchema = z.object({
  ...toggleSchema.shape,
  condition: computedCalculationFieldSchema,
});

export type Toggle = z.infer<typeof toggleSchema>;
export type ComputedToggle = z.infer<typeof computedToggleSchema>;
