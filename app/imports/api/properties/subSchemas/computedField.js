import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// Get schemas that apply fields directly so they can be gracefully extended
// because {type: Schema} fields can't be extended
function fieldToCompute(field){
  const schemaObj = {
    [`${field}.calculation`]: {
      type: String,
      max: STORAGE_LIMITS.calculation,
      optional: true,
    },
  }
  // If the field is an array, we need to include those fields as well
  includeParentFields(field, schemaObj);
  return new SimpleSchema(schemaObj);
}

function computedOnlyField(field){
  const schemaObj = {
    [`${field}.value`]: {
      type: SimpleSchema.oneOf(String, Number),
      optional: true,
      removeBeforeCompute: true,
    },
    // A list of effects targeting this calculation
    [`${field}.effects`]: {
      type: Array,
      optional: true,
      removeBeforeCompute: true,
    },
    [`${field}.effects.$`]: {
      type: Object,
      blackbox: true,
    },
    // A cache of the parse result of the calculation
    [`${field}.parseNode`]: {
      type: Object,
      optional: true,
      blackbox: true,
    },
    // Set if there was an error parsing the calculation
    [`${field}.parseError`]: {
      type: ErrorSchema,
      optional: true,
    },
    // a hash of the calculation to see if the cached values need to be updated
    [`${field}.hash`]: {
      type: Number,
      optional: true,
    },
    [`${field}.errors`]: {
      type: Array,
      optional: true,
      maxCount: STORAGE_LIMITS.errorCount,
      removeBeforeCompute: true,
    },
    [`${field}.errors.$`]:{
      type: ErrorSchema,
    },
  }
  includeParentFields(field, schemaObj);
  return new SimpleSchema(schemaObj);
}

// We must include parent array and object fields for the schema to be valid
function includeParentFields(field, schemaObj){
  const splitField = field.split('.');
  if (splitField.length === 1){
    schemaObj[field] = {
      type: Object,
      optional: true,
      computedField: true,
    };
    return;
  }
  let key = '';
  splitField.push('');
  splitField.forEach((value, index) => {
    if (key){
      if (value === '$'){
        schemaObj[key] = {
          type: Array,
          optional: true
        };
      } else {
        schemaObj[key] = {
          type: Object,
          optional: true,
        };
        // the last object is the computed field
        if (index === splitField.length - 1){
          schemaObj[key].computedField = true;
        }
      }
      key += '.';
    }
    key += value;
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
