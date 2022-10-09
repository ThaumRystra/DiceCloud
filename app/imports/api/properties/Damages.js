import SimpleSchema from 'simpl-schema';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

const DamageSchema = createPropertySchema({
  // The roll that determines how much to damage the attribute
  // This can be simplified, but only computed when applied
  amount: {
    type: 'fieldToCompute',
    optional: true,
    defaultValue: '1d8 + strength.modifier',
    parseLevel: 'compile',
  },
  // Who this damage applies to
  target: {
    type: String,
    defaultValue: 'target',
    allowedValues: [
      'self',
      'target',
    ],
  },
  damageType: {
    type: String,
    max: STORAGE_LIMITS.calculation,
    defaultValue: 'slashing',
    regEx: VARIABLE_NAME_REGEX,
  },
  // Prevent the property from showing up in the log
  silent: {
    type: Boolean,
    optional: true,
  },
});

const ComputedOnlyDamageSchema = createPropertySchema({
  amount: {
    type: 'computedOnlyField',
    optional: true,
    parseLevel: 'compile',
  },
});

const ComputedDamageSchema = new SimpleSchema()
  .extend(DamageSchema)
  .extend(ComputedOnlyDamageSchema);

export { DamageSchema, ComputedDamageSchema, ComputedOnlyDamageSchema };
