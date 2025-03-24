import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const DamageSchema = createPropertySchema({
  // The roll that determines how much to damage the attribute
  // This can be simplified, but only computed when applied
  amount: {
    type: 'fieldToCompute' as const,
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
    ] as const,
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
  // remove the entire object if there is no saving throw
  save: {
    type: Object,
    optional: true,
  },
  // The computed DC
  'save.dc': {
    type: 'fieldToCompute' as const,
    optional: true,
  },
  // The variable name of save to roll
  'save.stat': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  // The damage to deal on a successful save
  'save.damageFunction': {
    type: 'fieldToCompute' as const,
    optional: true,
    parseLevel: 'compile',
  },
});

const ComputedOnlyDamageSchema = createPropertySchema({
  amount: {
    type: 'computedOnlyField' as const,
    optional: true,
    parseLevel: 'compile',
  },
  save: {
    type: Object,
    optional: true,
  },
  'save.dc': {
    type: 'computedOnlyField' as const,
    parseLevel: 'compile',
    optional: true,
  },
  'save.damageFunction': {
    type: 'computedOnlyField' as const,
    parseLevel: 'compile',
    optional: true,
  },
});

const ComputedDamageSchema = TypedSimpleSchema.from({})
  .extend(DamageSchema)
  .extend(ComputedOnlyDamageSchema);

export { DamageSchema, ComputedDamageSchema, ComputedOnlyDamageSchema };
