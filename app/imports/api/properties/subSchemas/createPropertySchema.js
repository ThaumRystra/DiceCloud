import {
  inlineCalculationFieldToCompute,
  computedOnlyInlineCalculationField,
} from '/imports/api/properties/subSchemas/inlineCalculationField.js';
import {
  fieldToCompute,
  computedOnlyField,
} from '/imports/api/properties/subSchemas/computedField.js';
import SimpleSchema from 'simpl-schema';

export default function createPropertySchema(definition){
  const computationFields = {
    inlineCalculationFieldToCompute: [],
    computedOnlyInlineCalculationField: [],
    fieldToCompute: [],
    computedOnlyField: [],
  };
  const computedKeys = Object.keys(computationFields);

  for (let key in definition){
    const def = definition[key];
    if (computedKeys.includes(def.type)){
      computationFields[def.type].push(key);
      def.type = Object;
    }
  }

  const schema = new SimpleSchema(definition);

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
