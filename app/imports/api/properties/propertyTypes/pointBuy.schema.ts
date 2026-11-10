import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';
import { errorSchema } from '/imports/api/properties/subSchemas/error.schema';

export const pointBuySchema = z.object({
  type: z.literal('pointBuy'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  ignored: z.boolean().optional(),
  values: z
    .array(
      z.object({
        _id: z
          .string()
          .max(32)
          .default(() => Random.id()),
        name: z.string().max(STORAGE_LIMITS.name).optional(),
        variableName: z
          .string()
          .min(2)
          .max(STORAGE_LIMITS.variableName)
          .regex(VARIABLE_NAME_REGEX)
          .optional(),
        value: z.number().optional(),
      }),
    )
    .max(STORAGE_LIMITS.pointBuyRowsCount),
  min: calculationFieldSchema,
  max: calculationFieldSchema,
  total: calculationFieldSchema,
  cost: calculationFieldSchema.meta({ parseLevel: 'compile' }),
});

export const computedPointBuySchema = z.object({
  ...pointBuySchema.shape,
  min: computedCalculationFieldSchema,
  max: computedCalculationFieldSchema,
  cost: computedCalculationFieldSchema.meta({ parseLevel: 'compile' }),
  total: computedCalculationFieldSchema,
  values: z
    .array(
      z.object({
        _id: z
          .string()
          .max(32)
          .default(() => Random.id()),
        name: z.string().max(STORAGE_LIMITS.name).optional(),
        variableName: z
          .string()
          .min(2)
          .max(STORAGE_LIMITS.variableName)
          .regex(VARIABLE_NAME_REGEX)
          .optional(),
        value: z.number().optional(),
        spent: z.number().optional(),
        errors: z.array(errorSchema).optional(),
      }),
    )
    .max(STORAGE_LIMITS.pointBuyRowsCount),
  spent: z.number().optional(),
  pointsLeft: z.number().optional(),
  errors: z.array(errorSchema).optional(),
});

export type PointBuy = z.infer<typeof pointBuySchema>;
export type ComputedPointBuy = z.infer<typeof computedPointBuySchema>;
export type PointBuyRow = ComputedPointBuy['values'][number];
