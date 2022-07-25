import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';

/*
 * PointBuys are reason-value attached to skills and abilities
 * that modify their final value or presentation in some way
 */
let PointBuySchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  variableName: {
    type: String,
    optional: true,
    regEx: VARIABLE_NAME_REGEX,
    min: 2,
    max: STORAGE_LIMITS.variableName,
  },
  ignored: {
    type: Boolean,
    optional: true,
  },
  'values': {
    type: Array,
    defaultValue: [],
  },
  'values.$': {
    type: Object,
  },
  'values.$.name': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  'values.$.variableName': {
    type: String,
    optional: true,
    regEx: VARIABLE_NAME_REGEX,
    min: 2,
    max: STORAGE_LIMITS.variableName,
  },
  'values.$.value': {
    type: Number,
    optional: true,
  },
  min: {
    type: 'fieldToCompute',
    optional: true,
  },
  max: {
    type: 'fieldToCompute',
    optional: true,
  },
  total: {
    type: 'fieldToCompute',
    optional: true,
  },
  cost: {
    type: 'fieldToCompute',
    optional: true,
  },
});

const ComputedOnlyPointBuySchema = createPropertySchema({
  min: {
    type: 'computedOnlyField',
    optional: true,
  },
  max: {
    type: 'computedOnlyField',
    optional: true,
  },
  total: {
    type: 'computedOnlyField',
    optional: true,
  },
  cost: {
    type: 'computedOnlyField',
    optional: true,
  },
  spent: {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
});

const ComputedPointBuySchema = new SimpleSchema()
  .extend(ComputedOnlyPointBuySchema)
  .extend(PointBuySchema);

export { PointBuySchema, ComputedPointBuySchema, ComputedOnlyPointBuySchema };
