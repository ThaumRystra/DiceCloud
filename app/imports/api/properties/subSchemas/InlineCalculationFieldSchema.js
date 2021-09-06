import SimpleSchema from 'simpl-schema';
import InlineComputationSchema from '/imports/api/properties/subSchemas/InlineComputationSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

const InlineCalculationFieldToComputeSchema = new SimpleSchema({
  text: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.inlineCalculationField,
  },
});

const ComputedOnlyInlineCalculationFieldSchema = new SimpleSchema({
  'inlineCalculations': {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.inlineCalculationCount,
  },
  'inlineCalculations.$': {
    type: InlineComputationSchema,
  },
  value: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.inlineCalculationField,
  },
});

const InlineCalculationFieldSchema = new SimpleSchema()
  .extend(InlineCalculationFieldToComputeSchema)
  .extend(ComputedOnlyInlineCalculationFieldSchema)

export {
  InlineCalculationFieldToComputeSchema,
  ComputedOnlyInlineCalculationFieldSchema,
  InlineCalculationFieldSchema,
};
