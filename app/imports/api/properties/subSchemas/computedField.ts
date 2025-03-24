import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import ParseNode from '/imports/parser/parseTree/ParseNode';
import { ConstantValueType } from '/imports/parser/parseTree/constant';

export type FieldToCalculate = {
  calculation?: string;
}

export type CalculatedOnlyField = {
  value?: ConstantValueType;
  valueNode?: ParseNode;
  effectIds?: string[];
  proficiencyIds?: string[];
  unaffected?: ConstantValueType;
  parseNode?: ParseNode;
  parseError?: any;
  hash?: number;
  errors?: any[];
}

export type CalculatedField = FieldToCalculate & CalculatedOnlyField;

// Get schemas that apply fields directly so they can be gracefully extended
// because {type: Schema} fields can't be extended
function fieldToCompute(field) {
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

function computedOnlyField(field) {
  const schemaObj = {
    // The value (or calculation string) before any effects/proficiencies are applied or rolls made
    [`${field}.unaffected`]: {
      type: SimpleSchema.oneOf(String, Number),
      optional: true,
      blackbox: true,
    },
    // The value (or calculation string) after applying all effects
    [`${field}.value`]: {
      type: SimpleSchema.oneOf(String, Number),
      optional: true,
      blackbox: true,
    },
    // The value as a parse node, after applying all effects
    [`${field}.valueNode`]: {
      type: SimpleSchema.oneOf(String, Number),
      optional: true,
      blackbox: true,
    },
    // A list of effect Ids targeting this calculation
    [`${field}.effectIds`]: {
      type: Array,
      optional: true,
      removeBeforeCompute: true,
    },
    [`${field}.effectIds.$`]: {
      type: String,
    },
    [`${field}.proficiencyIds`]: {
      type: Array,
      optional: true,
      removeBeforeCompute: true,
    },
    [`${field}.proficiencyIds.$`]: {
      type: String,
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
    [`${field}.errors.$`]: {
      type: ErrorSchema,
    },
    // Effect aggregations
    [`${field}.advantage`]: {
      type: Number,
      optional: true,
      removeBeforeCompute: true,
    },
    [`${field}.disadvantage`]: {
      type: Number,
      optional: true,
      removeBeforeCompute: true,
    },
    [`${field}.fail`]: {
      type: Number,
      optional: true,
      removeBeforeCompute: true,
    },
    [`${field}.conditional`]: {
      type: Array,
      optional: true,
      removeBeforeCompute: true,
    },
    [`${field}.conditional.$`]: {
      type: String,
    },
  }
  includeParentFields(field, schemaObj);
  return new SimpleSchema(schemaObj);
}

// We must include parent array and object fields for the schema to be valid
function includeParentFields(field, schemaObj) {
  const splitField = field.split('.');
  if (splitField.length === 1) {
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
    if (key) {
      if (value === '$') {
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
        if (index === splitField.length - 1) {
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
function computedField(field) {
  return computedField(field).extend(computedOnlyField(field));
}

export {
  fieldToCompute,
  computedOnlyField,
  computedField,
};
