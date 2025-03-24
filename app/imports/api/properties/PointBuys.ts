import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

/*
 * PointBuys are reason-value attached to skills and abilities
 * that modify their final value or presentation in some way
 */
const PointBuySchema = createPropertySchema({
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
    max: 32,
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
    type: 'fieldToCompute' as const,
    optional: true,
  },
  max: {
    type: 'fieldToCompute' as const,
    optional: true,
  },
  total: {
    type: 'fieldToCompute' as const,
    optional: true,
  },
  cost: {
    type: 'fieldToCompute' as const,
    optional: true,
    parseLevel: 'compile',
  },
});

const ComputedOnlyPointBuySchema = createPropertySchema({
  min: {
    type: 'computedOnlyField' as const,
    optional: true,
  },
  max: {
    type: 'computedOnlyField' as const,
    optional: true,
  },
  cost: {
    type: 'computedOnlyField' as const,
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
    type: 'computedOnlyField' as const,
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

const ComputedPointBuySchema = TypedSimpleSchema.from({})
  .extend(ComputedOnlyPointBuySchema)
  .extend(PointBuySchema);

export { PointBuySchema, ComputedPointBuySchema, ComputedOnlyPointBuySchema };
