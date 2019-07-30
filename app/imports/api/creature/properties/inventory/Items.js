import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

Items = new Mongo.Collection("items");

ItemSchema = schema({
	name: {
		type: String,
		optional: true,
		defaultValue: "New Item",
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
});

ItemSchema.extend(ColorSchema);

Items.attachSchema(ItemSchema);
Items.attachSchema(PropertySchema);
Items.attachSchema(ChildSchema);

export default Items;
export { ItemSchema };
