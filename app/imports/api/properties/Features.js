import SimpleSchema from 'simpl-schema';
import InlineComputationSchema from '/imports/api/properties/subSchemas/InlineComputationSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

let FeatureSchema = new SimpleSchema({
	name: {
		type: String,
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
});

let ComputedOnlyFeatureSchema = new SimpleSchema({

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

});

const ComputedFeatureSchema = new SimpleSchema()
  .extend(FeatureSchema)
  .extend(ComputedOnlyFeatureSchema);

export { FeatureSchema, ComputedFeatureSchema, ComputedOnlyFeatureSchema }
