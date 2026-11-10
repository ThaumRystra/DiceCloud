import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  calculationFieldSchema,
  computedCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/calculationField.schema';
import {
  inlineCaluclationFieldSchema,
  computedInlineCalculationFieldSchema,
} from '/imports/api/properties/subSchemas/inlineCalculationField.schema';

export const spellListSchema = z.object({
  type: z.literal('spellList'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  description: inlineCaluclationFieldSchema,
  // Calculation of how many spells in this list can be prepared
  maxPrepared: calculationFieldSchema,
  // The variable name of the ability this spell relies on
  ability: z.string().max(STORAGE_LIMITS.variableName).optional(),
  // Calculation of The attack roll bonus used by spell attacks in this list
  attackRollBonus: calculationFieldSchema,
  // Calculation of the save dc used by spells in this list
  dc: calculationFieldSchema,
});

export const computedSpellListSchema = z.object({
  ...spellListSchema.shape,
  description: computedInlineCalculationFieldSchema,
  maxPrepared: computedCalculationFieldSchema,
  // Computed value determined by the ability
  abilityMod: z.int().optional(),
  attackRollBonus: computedCalculationFieldSchema,
  dc: computedCalculationFieldSchema,
});

export type SpellList = z.infer<typeof spellListSchema>;
export type ComputedSpellList = z.infer<typeof computedSpellListSchema>;
