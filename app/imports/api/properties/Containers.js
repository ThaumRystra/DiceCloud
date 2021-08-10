import SimpleSchema from 'simpl-schema';
import InlineComputationSchema from '/imports/api/properties/subSchemas/InlineComputationSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

let ContainerSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
		trim: false,
    max: STORAGE_LIMITS.name,
	},
	carried: {
		type: Boolean,
		defaultValue: true,
		optional: true,
	},
	contentsWeightless: {
		type: Boolean,
		optional: true,
	},
	weight: {
		type: Number,
		min: 0,
    optional: true,
	},
	value: {
		type: Number,
		min: 0,
    optional: true,
	},
	description: {
		type: String,
		optional: true,
		trim: false,
    max: STORAGE_LIMITS.description,
	},
});

const ComputedOnlyContainerSchema = new SimpleSchema({
  descriptionCalculations: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.inlineCalculationCount,
  },
  'descriptionCalculations.$': InlineComputationSchema,
  // Weight of all the contents, zero if `contentsWeightless` is true
  contentsWeight:{
    type: Number,
    optional: true,
  },
  contentsValue:{
    type: Number,
    optional: true,
  },
});

const ComputedContainerSchema = new SimpleSchema()
	.extend(ComputedOnlyContainerSchema)
	.extend(ContainerSchema);

export { ContainerSchema, ComputedOnlyContainerSchema, ComputedContainerSchema };
