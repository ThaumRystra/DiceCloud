import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const SpellListSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: 'inlineCalculationFieldToCompute' as const,
    optional: true,
  },
  // Calculation of how many spells in this list can be prepared
  maxPrepared: {
    type: 'fieldToCompute' as const,
    optional: true,
  },
  // The variable name of the ability this spell relies on
  ability: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  // Calculation of The attack roll bonus used by spell attacks in this list
  attackRollBonus: {
    type: 'fieldToCompute' as const,
    optional: true,
  },
  // Calculation of the save dc used by spells in this list
  dc: {
    type: 'fieldToCompute' as const,
    optional: true,
  },
});

const ComputedOnlySpellListSchema = createPropertySchema({
  description: {
    type: 'computedOnlyInlineCalculationField' as const,
    optional: true,
  },
  maxPrepared: {
    type: 'computedOnlyField' as const,
    optional: true,
  },
  // Computed value determined by the ability
  abilityMod: {
    type: SimpleSchema.Integer,
    optional: true,
    removeBeforeCompute: true,
  },
  attackRollBonus: {
    type: 'computedOnlyField' as const,
    optional: true,
  },
  dc: {
    type: 'computedOnlyField' as const,
    optional: true,
  },
});

const ComputedSpellListSchema = TypedSimpleSchema.from({})
  .extend(SpellListSchema)
  .extend(ComputedOnlySpellListSchema);

export { SpellListSchema, ComputedOnlySpellListSchema, ComputedSpellListSchema };
