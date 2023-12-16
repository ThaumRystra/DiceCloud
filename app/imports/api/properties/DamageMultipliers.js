import createPropertySchema from './subSchemas/createPropertySchema';
import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

/*
 * DamageMultipliers are multipliers that affect how much damage is taken from
 * a given damage type
 */
let DamageMultiplierSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  damageTypes: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.damageTypeCount,
  },
  // The technical, lowercase, single-word name used in formulae
  'damageTypes.$': {
    type: String,
    max: STORAGE_LIMITS.calculation,
    regEx: VARIABLE_NAME_REGEX,
  },
  // The value of the damage multiplier
  value: {
    type: Number,
    defaultValue: 0.5,
    allowedValues: [0, 0.5, 2, -1],
  },
  // The amount to apply for flat reductions
  reductionAmount: {
    type: 'fieldToCompute',
    optional: true
  },
  // Tags which bypass this multiplier (OR)
  excludeTags: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.tagCount,
  },
  'excludeTags.$': {
    type: String,
    max: STORAGE_LIMITS.tagLength,
  },
  // Tags which must be present to be affected by this multiplier (AND)
  includeTags: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.tagCount,
  },
  'includeTags.$': {
    type: String,
    max: STORAGE_LIMITS.tagLength,
  },
});

const ComputedOnlyDamageMultiplierSchema = createPropertySchema({
  reductionAmount: {
    type: 'computedOnlyField',
    optional: true,
  },
});

const ComputedDamageMultiplierSchema = new SimpleSchema()
  .extend(ComputedOnlyDamageMultiplierSchema)
  .extend(DamageMultiplierSchema);

export { DamageMultiplierSchema, ComputedDamageMultiplierSchema, ComputedOnlyDamageMultiplierSchema };
