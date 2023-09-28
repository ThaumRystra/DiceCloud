import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { CalculatedField } from './computedField';

export interface InlineCalculation {
  text?: string,
  hash?: number,
  value?: string,
  inlineCalculations: CalculatedField[],
}

// Get schemas that apply fields directly so they can be gracefully extended
// because {type: Schema} fields can't be extended
function inlineCalculationFieldToCompute(field) {
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

function computedOnlyInlineCalculationField(field) {
  return new SimpleSchema({
    // The object should already be set, but set again just in case
    [field]: {
      type: Object,
      optional: true,
      inlineCalculationField: true,
    },
    // a hash of the text to see if the current cached values need to be updated
    [`${field}.hash`]: {
      type: Number,
      optional: true,
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
    },
    [`${field}.inlineCalculations.$`]: {
      type: Object,
      parseLevel: 'reduce',
      computedField: true,
    },
    // The part between bracers {}
    [`${field}.inlineCalculations.$.calculation`]: {
      type: String,
      max: STORAGE_LIMITS.calculation,
    },
    // The result of the calc
    [`${field}.inlineCalculations.$.value`]: {
      type: SimpleSchema.oneOf(String, Number),
      optional: true,
      max: STORAGE_LIMITS.calculation,
      removeBeforeCompute: true,
    },
    // A cache of the parse result of the calculation
    [`${field}.inlineCalculations.$.parseNode`]: {
      type: Object,
      optional: true,
      blackbox: true,
    },
    // Set if there was an error parsing the calculation
    [`${field}.inlineCalculations.$.parseError`]: {
      type: ErrorSchema,
      optional: true,
    },
    // a hash of the calculation to see if the cached values need to be updated
    [`${field}.inlineCalculations.$.hash`]: {
      type: Number,
      optional: true,
    },
    [`${field}.inlineCalculations.$.errors`]: {
      type: Array,
      optional: true,
      maxCount: STORAGE_LIMITS.errorCount,
      removeBeforeCompute: true,
    },
    [`${field}.inlineCalculations.$.errors.$`]: {
      type: ErrorSchema,
    },
  });
}

function computedInlineCalculationField(field) {
  return inlineCalculationFieldToCompute(field).extend(
    computedOnlyInlineCalculationField(field)
  )
}

export {
  inlineCalculationFieldToCompute,
  computedOnlyInlineCalculationField,
  computedInlineCalculationField,
};
