import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema';

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
  ignored: {
    type: Boolean,
    optional: true,
  },
  'values': {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.pointBuyRowsCount,
  },
  'values.$': {
    type: Object,
  },
  'values.$._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      if (!this.isSet) return Random.id();
    }
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
    parseLevel: 'compile',
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
  cost: {
    type: 'computedOnlyField',
    optional: true,
    parseLevel: 'compile',
  },
  'values': {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.pointBuyRowsCount,
  },
  'values.$': {
    type: Object,
  },
  'values.$.spent': {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
  'values.$.errors': {
    type: Array,
    optional: true,
    removeBeforeCompute: true,
  },
  'values.$.errors.$': {
    type: ErrorSchema,
  },
  total: {
    type: 'computedOnlyField',
    optional: true,
  },
  spent: {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
  pointsLeft: {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
  errors: {
    type: Array,
    optional: true,
    removeBeforeCompute: true,
  },
  'errors.$': {
    type: ErrorSchema,
  },
});

const ComputedPointBuySchema = new SimpleSchema()
  .extend(ComputedOnlyPointBuySchema)
  .extend(PointBuySchema);

export { PointBuySchema, ComputedPointBuySchema, ComputedOnlyPointBuySchema };
