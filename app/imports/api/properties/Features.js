import SimpleSchema from 'simpl-schema';
import InlineComputationSchema from '/imports/api/properties/subSchemas/InlineComputationSchema.js';

let FeatureSchema = new SimpleSchema({
	name: {
		type: String,
	},
	summary: {
		type: String,
		optional: true,
	},
  description: {
		type: String,
		optional: true,
	},
});

let ComputedOnlyFeatureSchema = new SimpleSchema({

  summaryCalculations: {
    type: Array,
    maxCount: 32,
  },
  'summaryCalculations.$': InlineComputationSchema,

  descriptionCalculations: {
    type: Array,
    maxCount: 32,
  },
  'descriptionCalculations.$': InlineComputationSchema,

});

const ComputedFeatureSchema = new SimpleSchema()
  .extend(FeatureSchema)
  .extend(ComputedOnlyFeatureSchema);

export { FeatureSchema, ComputedFeatureSchema, ComputedOnlyFeatureSchema }
