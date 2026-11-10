import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { inlineCaluclationFieldSchema } from '/imports/api/properties/subSchemas/inlineCalculationField.schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';
import { computedInlineCalculationField } from '/imports/api/properties/subSchemas/inlineCalculationField';
import colorSchema from '/imports/api/properties/subSchemas/color.schema';

export const actionSchema = z.object({
  type: z.literal('action'),
  name: z.string().max(STORAGE_LIMITS.name),
  summary: inlineCaluclationFieldSchema,
  description: inlineCaluclationFieldSchema,
  actionType: z
    .enum(['action', 'bonus', 'attack', 'reaction', 'free', 'long', 'event'])
    .default('action'),
  varialeName: z
    .string()
    .min(2)
    .max(STORAGE_LIMITS.variableName)
    .regex(VARIABLE_NAME_REGEX)
    .optional(),
  target: z.enum(['self', 'singleTarget', 'multipleTargets']),
  attackRoll: calculationFieldSchema,
  uses: calculationFieldSchema.meta({ parseLevel: 'reduce' }),
  usesUsed: z.int(),
  reset: z
    .string()
    .min(2)
    .max(STORAGE_LIMITS.variableName)
    .regex(VARIABLE_NAME_REGEX)
    .optional(),
  resources: z.object({
    itemsConsumed: z.array(
      z.object({
        _id: z
          .string()
          .max(32)
          .default(() => Random.id()),
        tag: z.string().max(STORAGE_LIMITS.tagLength),
        quantity: calculationFieldSchema,
        itemId: z.string().brand('CreaturePropertyId').max(32).optional(),
      }),
    ),
    attributesConsumed: z.array(
      z.object({
        _id: z
          .string()
          .max(32)
          .default(() => Random.id()),
        variableName: z.string().max(STORAGE_LIMITS.variableName).optional(),
        quantity: calculationFieldSchema,
      }),
    ),
    // These must be true for the action to be taken
    conditions: z.array(
      z.object({
        _id: z
          .string()
          .max(32)
          .default(() => Random.id()),
        condition: calculationFieldSchema,
        conditionNode: z.string().optional(),
      }),
    ),
  }),
});

export const computedActionSchema = z.object({
  ...actionSchema.shape,
  summary: computedInlineCalculationField,
  description: computedInlineCalculationField,
  insufficientResources: z.literal(true).optional(),
  attackRoll: computedCalculationFieldSchema,
  uses: computedCalculationFieldSchema.meta({ parseLevel: 'reduce' }),
  usesLeft: z.number().optional(),
  overridden: z.literal(true).optional(),
  itemsConsumed: z.array(
    z.object({
      _id: z
        .string()
        .max(32)
        .default(() => Random.id()),
      tag: z.string().max(STORAGE_LIMITS.tagLength),
      quantity: computedCalculationFieldSchema,
      itemId: z.string().brand('CreaturePropertyId').max(32).optional(),
      available: z.number().optional(),
      itemName: z.string().max(STORAGE_LIMITS.name).optional(),
      itemIcon: z.string().max(STORAGE_LIMITS.name),
      itemColor: colorSchema.shape.color,
    }),
  ),
  attributesConsumed: z.array(
    z.object({
      _id: z
        .string()
        .max(32)
        .default(() => Random.id()),
      variableName: z.string().max(STORAGE_LIMITS.variableName).optional(),
      quantity: computedCalculationFieldSchema,
      statName: z.string().max(STORAGE_LIMITS.variableName).optional(),
    }),
  ),
  // These must be true for the action to be taken
  conditions: z.array(
    z.object({
      _id: z
        .string()
        .max(32)
        .default(() => Random.id()),
      condition: computedCalculationFieldSchema,
      conditionNode: z.string().optional(),
    }),
  ),
});

export type Action = z.infer<typeof actionSchema>;
export type ComputedAction = z.infer<typeof computedActionSchema>;
