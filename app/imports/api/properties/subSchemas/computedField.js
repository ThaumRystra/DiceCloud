import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// Get schemas that apply fields directly so they can be gracefully extended
// because {type: Schema} fields can't be extended
function fieldToCompute(field){
  const schemaObj = {
    // This is required, if we don't have a calculation delete the whole object
    [`${field}.calculation`]: {
      type: String,
      max: STORAGE_LIMITS.calculation,
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
    },
    [`${field}.errors`]: {
      type: Array,
      optional: true,
      maxCount: STORAGE_LIMITS.errorCount,
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
    schemaObj[field] = {type: Object};
    return;
  }
  let key = '';
  splitField.push('');
  splitField.forEach(value => {
    if (key){
      if (value === '$'){
        schemaObj[key] = {type: Array};
      } else {
        schemaObj[key] = {type: Object};
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
