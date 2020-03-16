import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

ItemSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
		defaultValue: "New Item",
	},
	// Variable name to reference this item as ammunition or in formulae
	variableName: {
    type: String,
		regEx: VARIABLE_NAME_REGEX,
    min: 3,
    defaultValue: 'newAttribute',
  },
	// Plural name of the item, if there is more than one
	plural: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
	// Number currently held
	quantity: {
		type: SimpleSchema.Integer,
		min: 0,
		defaultValue: 1
	},
	// Weight per item in the stack
	weight: {
		type: Number,
		min: 0,
		defaultValue: 0,
	},
	// Value per item in the stack, in gold pieces
	value: {
		type: Number,
		min: 0,
		defaultValue: 0,
	},
	// If this item is equipped, it requires attunement
	// Being equipped is `enabled === true`
	requiresAttunement: {
		type: Boolean,
		optional: true,
	},
	// Show increment/decrement buttons in item lists
	showIncrement: {
		type: Boolean,
		optional: true,
	},
	// Unequipped items shouldn't affect creature stats
	equipped: {
		type: Boolean,
		defaultValue: false,
	},
});

export { ItemSchema };
