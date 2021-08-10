import SimpleSchema from 'simpl-schema';
import InlineComputationSchema from '/imports/api/properties/subSchemas/InlineComputationSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

const ItemSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.name,
	},
	// Plural name of the item, if there is more than one
	plural: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.name,
	},
	description: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.description,
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
    optional: true,
	},
	// Value per item in the stack, in gold pieces
	value: {
		type: Number,
		min: 0,
    optional: true,
	},
	// If this item is equipped, it requires attunement
	requiresAttunement: {
		type: Boolean,
		optional: true,
	},
  attuned: {
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

let ComputedOnlyItemSchema = new SimpleSchema({
  descriptionCalculations: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.inlineCalculationCount,
  },
  'descriptionCalculations.$': InlineComputationSchema,
});

const ComputedItemSchema = new SimpleSchema()
  .extend(ItemSchema)
  .extend(ComputedOnlyItemSchema);

export { ItemSchema, ComputedItemSchema, ComputedOnlyItemSchema };
