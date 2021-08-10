import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import InlineComputationSchema from '/imports/api/properties/subSchemas/InlineComputationSchema.js';
import { storedIconsSchema } from '/imports/api/icons/Icons.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

/*
 * Actions are things a character can do
 * Any rolls that are children of actions will be rolled when taking the action
 * Any actions that are children of this action will be considered alternatives
 * to this action
 */
let ActionSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.name,
	},
	summary: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.summary,
	},
	description: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.description,
	},
	// What time-resource is used to take the action in combat
	// long actions take longer than 1 round to cast
	actionType: {
		type: String,
		allowedValues: ['action', 'bonus', 'attack', 'reaction', 'free', 'long'],
		defaultValue: 'action',
	},
	// Who is the action directed at
	target: {
		type: String,
		defaultValue: 'singleTarget',
		allowedValues: [
      'self',
      'singleTarget',
			'multipleTargets',
    ],
	},
  // Duplicate the ResourceSchema here so we can extend it elegantly.
  resources: {
    type: Object,
    defaultValue: {},
  },
  'resources.itemsConsumed': {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.resourcesCount,
  },
  'resources.itemsConsumed.$': {
    type: Object,
  },
  'resources.itemsConsumed.$._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue(){
      if (!this.isSet) return Random.id();
    }
  },
  'resources.itemsConsumed.$.tag': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.tagLength,
  },
  'resources.itemsConsumed.$.quantity': {
    type: Number,
    defaultValue: 1,
  },
  'resources.itemsConsumed.$.itemId': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  'resources.attributesConsumed': {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.resourcesCount,
  },
  'resources.attributesConsumed.$': {
    type: Object,
  },
  'resources.attributesConsumed.$._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue(){
      if (!this.isSet) return Random.id();
    }
  },
  'resources.attributesConsumed.$.variableName': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  'resources.attributesConsumed.$.quantity': {
    type: Number,
    defaultValue: 1,
  },
	// Calculation of how many times this action can be used
	uses: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.calculation,
	},
	// Integer of how many times it has already been used
	usesUsed: {
		type: SimpleSchema.Integer,
		optional: true,
	},
	// How this action's uses are reset automatically
	reset: {
		type: String,
		allowedValues: ['longRest', 'shortRest'],
		optional: true,
	},
});

const ComputedOnlyActionSchema = new SimpleSchema({
  summaryCalculations: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.inlineCalculationCount,
  },
  'summaryCalculations.$': InlineComputationSchema,

  descriptionCalculations: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.inlineCalculationCount,
  },
  'descriptionCalculations.$': InlineComputationSchema,

  usesResult: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  usesErrors: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.errorCount,
  },
  'usesErrors.$':{
    type: ErrorSchema,
  },
  resources: Object,
  'resources.itemsConsumed': Array,
  'resources.itemsConsumed.$': Object,
  'resources.itemsConsumed.$.available': {
    type: Number,
    optional: true,
  },
  // This appears both in the computed and uncomputed schema because it can be
  // set by both a computation or a form
  'resources.itemsConsumed.$.itemId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  'resources.itemsConsumed.$.itemName': {
    type: String,
    max: STORAGE_LIMITS.name,
    optional: true,
  },
  'resources.itemsConsumed.$.itemIcon': {
    type: storedIconsSchema,
    optional: true,
    max: STORAGE_LIMITS.icon,
  },
  'resources.itemsConsumed.$.itemColor': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.color,
  },
  'resources.attributesConsumed': Array,
  'resources.attributesConsumed.$': Object,
  'resources.attributesConsumed.$.available': {
    type: Number,
    optional: true,
  },
  'resources.attributesConsumed.$.statId': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  'resources.attributesConsumed.$.statName': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // True if the uses left is zero, or any item or attribute consumed is
  // insufficient
  insufficientResources: {
    type: Boolean,
    optional: true,
  },
});

const ComputedActionSchema = new SimpleSchema()
  .extend(ActionSchema)
  .extend(ComputedOnlyActionSchema);

export { ActionSchema, ComputedOnlyActionSchema, ComputedActionSchema};
