import SimpleSchema from 'simpl-schema';
import InlineComputationSchema from '/imports/api/properties/subSchemas/InlineComputationSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// Get schemas that apply fields directly so they can be gracefully extended
// because {type: Schema} fields can't be extended
function inlineCalculationFieldToCompute(field){
  return new SimpleSchema({
    // The object should already be set, but set again just in case
    [field]: {
      type: Object,
      optional: true,
    },
    [`${field}.text`]: {
      type: String,
      optional: true,
      max: STORAGE_LIMITS.inlineCalculationField,
    },
  });
}

function computedOnlyInlineCalculationField(field){
  return new SimpleSchema({
    // The object should already be set, but set again just in case
    [field]: {
      type: Object,
      optional: true,
    },
    [`${field}.inlineCalculations`]: {
      type: Array,
      defaultValue: [],
      maxCount: STORAGE_LIMITS.inlineCalculationCount,
    },
    [`${field}.inlineCalculations.$`]: {
      type: InlineComputationSchema,
    },
    [`${field}.value`]: {
      type: String,
      optional: true,
      max: STORAGE_LIMITS.inlineCalculationField,
    },
  });
}

function computedInlineCalculationField(field){
  return inlineCalculationFieldToCompute(field).extend(
    computedOnlyInlineCalculationField(field)
  )
}

export {
  inlineCalculationFieldToCompute,
  computedOnlyInlineCalculationField,
  computedInlineCalculationField,
};
