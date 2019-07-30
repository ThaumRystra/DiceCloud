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
  // The technical, lowercase, single-word name used in formulae
  damageType: {
    type: String,
		allowedValues: DAMAGE_TYPES,
    defaultValue: 'bludgeoning',
  },
	// The value of the damage multiplier
	value: {
    type: Number,
		defaultValue: 0.5,
		allowedValues: [0, 0.5, 2],
  },
});

export { DamageMultiplierSchema };
