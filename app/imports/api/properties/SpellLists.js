import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

let SpellListSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
	},
	// The technical, lowercase, single-word name used in formulae
  variableName: {
    type: String,
		regEx: VARIABLE_NAME_REGEX,
    min: 3,
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

export { SpellListSchema }
