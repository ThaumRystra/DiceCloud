import SimpleSchema from 'simpl-schema';
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';

/*
 * DamageMultipliers are multipliers that affect how much damage is taken from
 * a given damage type
 */
let DamageMultiplierSchema = new SimpleSchema({
  name: {
		type: String,
		optional: true,
	},
  damageTypes: {
    type: Array,
    defaultValue: [],
  },
  // The technical, lowercase, single-word name used in formulae
  'damageTypes.$': {
    type: String,
		allowedValues: DAMAGE_TYPES,
  },
	// The value of the damage multiplier
	value: {
    type: Number,
		defaultValue: 0.5,
		allowedValues: [0, 0.5, 2],
  },
  // Tags which bypass this multiplier (OR)
  excludeTags: {
    type: Array,
    defaultValue: [],
  },
  'excludeTags.$': {
    type: String,
  },
  // Tags which must be present to be affected by this multiplier (AND)
  includeTags: {
    type: Array,
    defaultValue: [],
  },
  'includeTags.$': {
    type: String,
  },
});

export { DamageMultiplierSchema };
