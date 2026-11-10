import z from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { errorSchema } from '/imports/api/properties/subSchemas/error.schema';

export const inlineCaluclationFieldSchema = z
  .object({
    text: z.string().default(''),
  })
  .meta({ type: 'inlineCalculationField' });

export const computedInlineCalculationFieldSchema = z.object({
  ...inlineCaluclationFieldSchema.shape,
  hash: z.string(),
  value: z.string(),
  inlineCalculations: z.array(
    z.object({
      calculation: z.string().max(STORAGE_LIMITS.calculation),
      value: z.union([z.string(), z.number()]).default(''),
      errors: z.array(errorSchema).optional(),
    }),
  ),
});

export type InlineCalculationField = z.infer<
  typeof inlineCaluclationFieldSchema
>;
export type ComputedInlineCalculationField = z.infer<
  typeof computedInlineCalculationFieldSchema
>;
export type InlineCalculation =
  ComputedInlineCalculationField['inlineCalculations'][number];
