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
import { tagTargetingSchema } from '/imports/api/properties/subSchemas/tagTargeting.schema';

export const skillSchema = z.object({
  type: z.literal('skill'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  // The technical, lowercase, single-word name used in formulae
  // Ignored for skilltype = save
  variableName: z
    .string()
    .min(2)
    .max(STORAGE_LIMITS.variableName)
    .regex(VARIABLE_NAME_REGEX)
    .optional(),
  // The variable name of the ability this skill relies on
  ability: z.string().max(STORAGE_LIMITS.variableName).optional(),
  // What type of skill is this
  skillType: z
    .enum([
      'skill',
      'save',
      'check',
      'tool',
      'weapon',
      'armor',
      'language',
      'utility',
    ])
    .default('skill'),
  // The base proficiency of this skill
  baseProficiency: z
    .union([z.literal(0.49), z.literal(0.5), z.literal(1), z.literal(2)])
    .optional(),
  // The starting value, before effects
  baseValue: calculationFieldSchema,
  // Description of what the skill is used for
  description: inlineCaluclationFieldSchema,
  // Skills can apply their value to other calculations as a proficiency using tag targeting
  ...tagTargetingSchema.shape,
});

export const computedSkillSchema = z.object({
  ...skillSchema.shape,
  // Computed value of skill to be added to skill rolls
  value: z.number().default(0).optional(),
  // The result of baseValueCalculation
  baseValue: computedCalculationFieldSchema,
  description: computedInlineCalculationFieldSchema,
  // Computed value added by the ability
  abilityMod: z.int().optional(),
  // Computed advantage/disadvantage
  advantage: z.union([z.literal(-1), z.literal(0), z.literal(1)]).optional(),
  // Computed bonus to passive checks
  passiveBonus: z.number().optional(),
  // Computed proficiency multiplier
  proficiency: z
    .union([
      z.literal(0),
      z.literal(0.49),
      z.literal(0.5),
      z.literal(1),
      z.literal(2),
    ])
    .default(0),
  // Compiled text of all conditional benefits
  conditionalBenefits: z.array(z.string()).optional(),
  // Computed number of things forcing this skill to fail
  fail: z.int().optional(),
  // Should this attribute hide
  hide: z.boolean().optional(),
  // Denormalised tag if stat is overridden by one with the same variable name
  overridden: z.boolean().optional(),
  // A list of effect ids targeting this skill
  effectIds: z.array(z.string()).optional(),
  proficiencyIds: z.array(z.string()).optional(),
  definitions: z
    .array(
      z.object({
        _id: z.string(),
        type: z.string(),
        row: z.number().optional(),
      }),
    )
    .optional(),
  // Triggers that fire when this property is used to make a check
  checkTriggerIds: z
    .object({
      before: z.array(z.string().max(32)).optional(),
      after: z.array(z.string().max(32)).optional(),
      afterChildren: z.array(z.string().max(32)).optional(),
    })
    .optional(),
});

export type Skill = z.infer<typeof skillSchema>;
export type ComputedSkill = z.infer<typeof computedSkillSchema>;
