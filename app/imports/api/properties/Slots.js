import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';

let SlotSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  slotType: {
    type: String,
    optional: true,
  },
	slotTags: {
    type: Array,
		defaultValue: [],
  },
	'slotTags.$': {
		type: String,
	},
  quantityExpected: {
    type: SimpleSchema.Integer,
    defaultValue: 1,
  },
  ignored: {
    type: Boolean,
    optional: true,
  },
  slotCondition: {
    type: String,
    optional: true,
  },
  // How many properties have been selected to fill this slot
  quantityFilled: {
    type: SimpleSchema.Integer,
    defaultValue: 0,
  },
});

const ComputedOnlySlotSchema = new SimpleSchema({
	// The computed result of the effect
	slotConditionResult: {
		type: SimpleSchema.oneOf(Number, String, Boolean),
		optional: true,
	},
  // The errors encountered while computing the result
  slotConditionErrors: {
    type: Array,
    optional: true,
  },
  'slotConditionErrors.$':{
    type: ErrorSchema,
  },
});

const ComputedSlotSchema = new SimpleSchema()
	.extend(ComputedOnlySlotSchema)
	.extend(SlotSchema);

export { SlotSchema, ComputedSlotSchema, ComputedOnlySlotSchema };
