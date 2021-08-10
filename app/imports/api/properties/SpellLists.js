import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import InlineComputationSchema from '/imports/api/properties/subSchemas/InlineComputationSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

let SpellListSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.name,
	},
	description: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.description,
	},
	// Calculation of how many spells in this list can be prepared
	maxPrepared: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.calculation,
	},
  // Calculation of The attack roll bonus used by spell attacks in this list
  attackRollBonus: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.calculation,
	},
  // Calculation of the save dc used by spells in this list
  dc: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.calculation,
	},
});

const ComputedOnlySpellListSchema = new SimpleSchema({
  descriptionCalculations: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.inlineCalculationCount,
  },
  'descriptionCalculations.$': InlineComputationSchema,

  // maxPrepared
  maxPreparedResult: {
    type: Number,
    optional: true,
  },
  maxPreparedErrors: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.errorCount,
  },
  'maxPreparedErrors.$':{
    type: ErrorSchema,
  },

  // attackRollBonus
  attackRollBonusResult: {
    type: Number,
    optional: true,
  },
  attackRollBonusErrors: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.errorCount,
  },
  'attackRollBonusErrors.$':{
    type: ErrorSchema,
  },

  // dc
  dcResult: {
    type: Number,
    optional: true,
  },
  dcErrors: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.errorCount,
  },
  'dcErrors.$':{
    type: ErrorSchema,
  },
});

const ComputedSpellListSchema = new SimpleSchema()
  .extend(SpellListSchema)
  .extend(ComputedOnlySpellListSchema);

export { SpellListSchema, ComputedOnlySpellListSchema, ComputedSpellListSchema };
