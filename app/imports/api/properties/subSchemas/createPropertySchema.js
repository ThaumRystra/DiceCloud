import {
  inlineCalculationFieldToCompute,
  computedOnlyInlineCalculationField,
} from '/imports/api/properties/subSchemas/inlineCalculationField';
import {
  fieldToCompute,
  computedOnlyField,
} from '/imports/api/properties/subSchemas/computedField';
import SimpleSchema from 'simpl-schema';

// Search through the schema for keys whose type is 'fieldToCompute' etc.
// replace the type with Object and attach extend the schema with
// the required fields to make the computation work
export default function createPropertySchema(definition) {
  const computationFields = {
    inlineCalculationFieldToCompute: [],
    computedOnlyInlineCalculationField: [],
    fieldToCompute: [],
    computedOnlyField: [],
  };
  const computedKeys = Object.keys(computationFields);

  for (let key in definition) {
    const def = definition[key];
    if (computedKeys.includes(def.type)) {
      computationFields[def.type].push(key);
      applyDefaultCalculationValue(definition, key);
      def.type = Object;
      if (!def.optional) {
        console.warn(
          `computed field: '${key}' of '${def.type}' is expected to be optional`
        );
      }
      if (def.removeBeforeCompute) {
        console.warn(
          `computed field: '${key}' of '${def.type}' should not be removed before computation`
        )
      }
    }
  }

  // Create a schema with the edited definition
  const schema = new SimpleSchema(definition);

  // Extend the schema with all the computation fields
  computationFields.inlineCalculationFieldToCompute.forEach(key => {
    schema.extend(inlineCalculationFieldToCompute(key))
  });
  computationFields.computedOnlyInlineCalculationField.forEach(key => {
    schema.extend(computedOnlyInlineCalculationField(key))
  });
  computationFields.fieldToCompute.forEach(key => {
    schema.extend(fieldToCompute(key))
  });
  computationFields.computedOnlyField.forEach(key => {
    schema.extend(computedOnlyField(key))
  });
  return schema
}

function applyDefaultCalculationValue(definition, key) {
  const def = definition[key];
  if (
    def.type === 'computedOnlyField' ||
    def.type === 'computedOnlyInlineCalculationField'
  ) {
    // don't apply defaults to computed only fields
    // because it would add the calculation field which should only appear
    // on the fields to compute
    return;
  }
  let defaultValue = def.defaultValue;
  if (!defaultValue) return;
  let calcField;
  if (def.type === 'fieldToCompute') {
    calcField = key + '.calculation'
  } else {
    calcField = key + '.text'
  }
  if (definition[calcField]) {
    definition[calcField].defaultValue = defaultValue;
  } else {
    definition[calcField] = {
      type: String,
      defaultValue,
      optional: true,
    };
  }
  delete def.defaultValue;
}
