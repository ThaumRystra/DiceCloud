import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';

let SpellListSchema = createPropertySchema({
	name: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.name,
	},
  description: {
		type: 'inlineCalculationFieldToCompute',
		optional: true,
	},
	// Calculation of how many spells in this list can be prepared
	maxPrepared: {
    type: 'fieldToCompute',
    optional: true,
  },
  // Calculation of The attack roll bonus used by spell attacks in this list
  attackRollBonus: {
    type: 'fieldToCompute',
    optional: true,
  },
  // Calculation of the save dc used by spells in this list
  dc: {
    type: 'fieldToCompute',
    optional: true,
  },
});

const ComputedOnlySpellListSchema = new SimpleSchema({
  description: {
    type: 'computedOnlyInlineCalculationField',
    optional: true,
  },
  maxPrepared: {
    type: 'computedOnlyField',
    optional: true,
  },
  attackRollBonus: {
    type: 'computedOnlyField',
    optional: true,
  },
  dc: {
    type: 'computedOnlyField',
    optional: true,
  },
});

const ComputedSpellListSchema = new SimpleSchema()
  .extend(SpellListSchema)
  .extend(ComputedOnlySpellListSchema);

export { SpellListSchema, ComputedOnlySpellListSchema, ComputedSpellListSchema };
