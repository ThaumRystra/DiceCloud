import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';
import {
  inlineCaluclationFieldSchema,
  computedInlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/inlineCalculationField.schema';
import colorSchema from '/imports/api/properties/subSchemas/color.schema';

export const attributeSchema = z.object({
  type: z.literal('attribute'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  variableName: z
    .string()
    .min(2)
    .max(STORAGE_LIMITS.variableName)
    .regex(VARIABLE_NAME_REGEX)
    .optional(),
  attributeType: z
    .enum([
      'ability',
      'stat',
      'modifier',
      'hitDice',
      'healthBar',
      'resource',
      'spellSlot',
      'utility',
    ])
    .default('stat'),
  hitDiceSize: z
    .enum(['d1', 'd2', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'])
    .optional(),
  spellSlotLevel: calculationFieldSchema,
  healthBarColorMid: colorSchema.shape.color,
  healthBarColorLow: colorSchema.shape.color,
  healthBarNoDamage: z.boolean().optional(),
  healthBarNoHealing: z.boolean().optional(),
  healthBarNoDamageOverflow: z.boolean().optional(),
  healthBarNoHealingOverflow: z.boolean().optional(),
  healthBarDamageOrder: z.int().optional(),
  healthBarHealingOrder: z.int().optional(),
  baseValue: calculationFieldSchema,
  description: inlineCaluclationFieldSchema,
  damage: z.int().optional(),
  decimal: z.boolean().optional(),
  ignoreLowerLimit: z.boolean().optional(),
  ignoreUpperLimit: z.boolean().optional(),
  hideWhenTotalZero: z.boolean().optional(),
  hideWhenValueZero: z.boolean().optional(),
  reset: z
    .string()
    .min(2)
    .max(STORAGE_LIMITS.variableName)
    .regex(VARIABLE_NAME_REGEX)
    .optional(),
});

export const computedAttributeSchema = z.object({
  ...attributeSchema.shape,
  description: computedInlineCalculationFieldSchema,
  baseValue: computedCalculationFieldSchema,
  spellSlotLevel: computedCalculationFieldSchema,
  total: z.union([z.number(), z.string(), z.boolean()]).optional(),
  value: z.union([z.number(), z.string(), z.boolean()]).default(0),
  modifier: z.int().optional(),
  proficiency: z
    .union([
      z.literal(0),
      z.literal(0.49),
      z.literal(0.5),
      z.literal(1),
      z.literal(2),
    ])
    .optional(),
  advantage: z.union([z.literal(-1), z.literal(0), z.literal(1)]).optional(),
  constitutionMod: z.number().optional(),
  hide: z.boolean().optional(),
  overridden: z.boolean().optional(),
  effectIds: z.array(z.string()).optional(),
  proficiencyIds: z.array(z.string()).optional(),
  definitions: z
    .array(
      z.object({
        _id: z.string(),
        type: z.string().optional(),
        row: z.number().optional(),
      }),
    )
    .optional(),
  damageTriggerIds: z
    .object({
      before: z.array(z.string().max(32)).optional(),
      after: z.array(z.string().max(32)).optional(),
      afterChildren: z.array(z.string().max(32)).optional(),
    })
    .optional(),
  checkTriggerIds: z
    .object({
      before: z.array(z.string().max(32)).optional(),
      after: z.array(z.string().max(32)).optional(),
      afterChildren: z.array(z.string().max(32)).optional(),
    })
    .optional(),
});

export type Attribute = z.infer<typeof attributeSchema>;
export type ComputedAttribute = z.infer<typeof computedAttributeSchema>;
