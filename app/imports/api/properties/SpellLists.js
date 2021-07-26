import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import InlineComputationSchema from '/imports/api/properties/subSchemas/InlineComputationSchema.js';

let SpellListSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
	// Calculation of how many spells in this list can be prepared
	maxPrepared: {
		type: String,
		optional: true,
	},
  // Calculation of The attack roll bonus used by spell attacks in this list
  attackRollBonus: {
		type: String,
		optional: true,
	},
  // Calculation of the save dc used by spells in this list
  dc: {
		type: String,
		optional: true,
	},
});

const ComputedOnlySpellListSchema = new SimpleSchema({
  descriptionCalculations: {
    type: Array,
    defaultValue: [],
    maxCount: 32,
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
  },
  'dcErrors.$':{
    type: ErrorSchema,
  },
});

const ComputedSpellListSchema = new SimpleSchema()
  .extend(SpellListSchema)
  .extend(ComputedOnlySpellListSchema);

export { SpellListSchema, ComputedOnlySpellListSchema, ComputedSpellListSchema };
