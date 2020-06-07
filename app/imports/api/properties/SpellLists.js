import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';

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
});

const ComputedOnlySpellListSchema = new SimpleSchema({
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
});

const ComputedSpellListSchema = new SimpleSchema()
  .extend(SpellListSchema)
  .extend(ComputedOnlySpellListSchema);

export { SpellListSchema, ComputedOnlySpellListSchema, ComputedSpellListSchema };
