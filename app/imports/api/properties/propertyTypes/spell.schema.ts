import { z } from 'zod';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import {
  actionSchema,
  computedActionSchema,
} from '/imports/api/properties/propertyTypes/action.schema';

// Spells extend Actions in the SimpleSchema source, so the spell-specific fields
// are spread on top of the Action base (and the computed Action) schema.
const spellOnlyShape = {
  type: z.literal('spell'),
  name: z.string().max(STORAGE_LIMITS.name).optional(),
  // If it's always prepared, it doesn't count against the number of spells
  // prepared in a spell list, and enabled should be true
  alwaysPrepared: z.boolean().optional(),
  prepared: z.boolean().optional(),
  // This spell ignores spell slot rules
  castWithoutSpellSlots: z.boolean().optional(),
  hasAttackRoll: z.boolean().optional(),
  castingTime: z
    .string()
    .max(STORAGE_LIMITS.spellDetail)
    .default('action')
    .optional(),
  range: z.string().max(STORAGE_LIMITS.spellDetail).optional(),
  duration: z
    .string()
    .max(STORAGE_LIMITS.spellDetail)
    .default('Instantaneous')
    .optional(),
  verbal: z.boolean().optional(),
  somatic: z.boolean().optional(),
  concentration: z.boolean().optional(),
  material: z.string().max(STORAGE_LIMITS.spellDetail).optional(),
  ritual: z.boolean().optional(),
  level: z.int().min(0).max(9).default(1),
  school: z
    .enum([
      'abjuration',
      'conjuration',
      'divination',
      'enchantment',
      'evocation',
      'illusion',
      'necromancy',
      'transmutation',
    ])
    .default('abjuration'),
};

export const spellSchema = z.object({
  ...actionSchema.shape,
  ...spellOnlyShape,
});

export const computedSpellSchema = z.object({
  ...computedActionSchema.shape,
  ...spellOnlyShape,
});

export type Spell = z.infer<typeof spellSchema>;
export type ComputedSpell = z.infer<typeof computedSpellSchema>;
