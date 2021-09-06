import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// Get schemas that apply fields directly so they can be gracefully extended
// because {type: Schema} fields can't be extended
function fieldToCompute(field){
  return new SimpleSchema({
    // The object should already be set, but set again just in case
    [field]: {
      type: Object,
      optional: true,
    },
    // This is required, if we don't have a calculation delete the whole object
    [`${field}.calculation`]: {
      type: String,
      max: STORAGE_LIMITS.calculation,
    },
  });
}

function computedOnlyField(field){
  return new SimpleSchema({
    // The object should already be set, but set again just in case
    [field]: {
      type: Object,
      optional: true,
    },
    [`${field}.value`]: {
      type: SimpleSchema.oneOf(String, Number),
      optional: true,
    },
    [`${field}.errors`]: {
      type: Array,
      optional: true,
      maxCount: STORAGE_LIMITS.errorCount,
    },
    [`${field}.errors.$`]:{
      type: ErrorSchema,
    },
  });
}

// This should rarely be used, since the other two will merge correctly when
// uncomputed and computedOnly schemas are merged
function computedField(field){
  return computedField(field).extend(computedOnlyField(field));
}

export {
  fieldToCompute,
  computedOnlyField,
  computedField,
};
