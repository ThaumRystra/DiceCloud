import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

let SlotSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.description,
  },
  slotType: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
	slotTags: {
    type: Array,
		defaultValue: [],
    maxCount: STORAGE_LIMITS.tagCount,
  },
	'slotTags.$': {
		type: String,
    max: STORAGE_LIMITS.tagLength,
	},
	extraTags: {
    type: Array,
		defaultValue: [],
    maxCount: STORAGE_LIMITS.extraTagsCount,
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
    defaultValue: 'OR',
	},
  'extraTags.$.tags': {
		type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.tagCount,
	},
  'extraTags.$.tags.$': {
		type: String,
    max: STORAGE_LIMITS.tagLength,
	},
  quantityExpected: {
    type: String,
    optional: true,
    defaultValue: '1',
    max: STORAGE_LIMITS.calculation,
  },
  ignored: {
    type: Boolean,
    optional: true,
  },
  slotCondition: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.calculation,
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
    maxCount: STORAGE_LIMITS.errorCount,
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
    maxCount: STORAGE_LIMITS.errorCount,
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
