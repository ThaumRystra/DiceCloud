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
	extraTags: {
    type: Array,
		defaultValue: [],
    maxCount: 5,
  },
	'extraTags.$': {
		type: Object,
	},
  'extraTags.$._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue(){
      if (!this.isSet) return Random.id();
    }
	},
  'extraTags.$.operation': {
		type: String,
    allowedValues: ['OR', 'NOT'],
	},
  'extraTags.$.tags': {
		type: Array,
	},
  'extraTags.$.tags.$': {
		type: String,
	},
  quantityExpected: {
    type: String,
    optional: true,
    defaultValue: '1',
  },
  ignored: {
    type: Boolean,
    optional: true,
  },
  slotCondition: {
    type: String,
    optional: true,
  },
  hideWhenFull: {
    type: Boolean,
    optional: true,
    defaultValue: true,
  },
  unique: {
    type: String,
    allowedValues: [
      // Can't choose the same slot filler twice in this slot
      'uniqueInSlot',
      // Can't choose the same slot filler twice accross the whole creature
      'uniqueInCreature'
    ],
    optional: true,
    defaultValue: 'uniqueInSlot',
  },
});

const ComputedOnlySlotSchema = new SimpleSchema({
	// Condition calculation results
	slotConditionResult: {
		type: SimpleSchema.oneOf(Number, String, Boolean),
		optional: true,
	},
  slotConditionErrors: {
    type: Array,
    optional: true,
  },
  'slotConditionErrors.$':{
    type: ErrorSchema,
  },

  // Quantity Expected calculation results
  quantityExpectedResult: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  quantityExpectedErrors: {
    type: Array,
    optional: true,
  },
  'quantityExpectedErrors.$':{
    type: ErrorSchema,
  },

  // Denormalised fields
  totalFilled: {
    type: SimpleSchema.Integer,
    defaultValue: 0,
  },
  spaceLeft: {
    type: SimpleSchema.Integer,
    optional: true,
  },
});

const ComputedSlotSchema = new SimpleSchema()
	.extend(ComputedOnlySlotSchema)
	.extend(SlotSchema);

export { SlotSchema, ComputedSlotSchema, ComputedOnlySlotSchema };
