import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// Get schemas that apply fields directly so they can be gracefully extended
// because {type: Schema} fields can't be extended
function inlineCalculationFieldToCompute(field){
  return new SimpleSchema({
    // The object should already be set, but set again just in case
    [field]: {
      type: Object,
      optional: true,
      inlineCalculationField: true,
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
      inlineCalculationField: true,
    },
    [`${field}.value`]: {
      type: String,
      optional: true,
      max: STORAGE_LIMITS.inlineCalculationField,
      removeBeforeCompute: true,
    },
    [`${field}.inlineCalculations`]: {
      type: Array,
      defaultValue: [],
      maxCount: STORAGE_LIMITS.inlineCalculationCount,
      removeBeforeCompute: true,
    },
    [`${field}.inlineCalculations.$`]: {
      type: Object,
      parseLevel: 'compile',
      computedField: true,
    },
    // The part between bracers {}
    [`${field}.inlineCalculations.$.calculation`]: {
      type: String,
      max: STORAGE_LIMITS.calculation,
    },
    [`${field}.inlineCalculations.$.value`]: {
      type: SimpleSchema.oneOf(String, Number),
      optional: true,
      max: STORAGE_LIMITS.calculation,
    },
    [`${field}.inlineCalculations.$.errors`]: {
      type: Array,
      optional: true,
      maxCount: STORAGE_LIMITS.errorCount,
    },
    [`${field}.inlineCalculations.$.errors.$`]: {
      type: ErrorSchema,
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
