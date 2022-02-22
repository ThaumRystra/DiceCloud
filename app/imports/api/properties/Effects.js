import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';

/*
 * Effects are reason-value attached to skills and abilities
 * that modify their final value or presentation in some way
 */
let EffectSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  operation: {
    type: String,
    defaultValue: 'add',
    allowedValues: [
      'base',
      'add',
      'mul',
      'min',
      'max',
      'set',
      'advantage',
      'disadvantage',
      'passiveAdd',
      'fail',
      'conditional',
    ],
  },
  amount: {
    type: 'fieldToCompute',
    optional: true,
  },
  // Conditional benefits store just uncomputed text
  text: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.effectCondition,
  },
  // Which stats the effect is applied to
  // Each entry is a variableName targeted by this effect
  stats: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.statsToTarget,
  },
  'stats.$': {
    type: String,
    max: STORAGE_LIMITS.variableName,
  },
  // True when targeting by tags instead of stats
  targetByTags: {
    type: Boolean,
    optional: true,
  },
  // If targeting by tags, the field which will be targeted
  targetField: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  // Which tags the effect is applied to
  targetTags: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.tagCount,
  },
  'targetTags.$': {
    type: String,
    max: STORAGE_LIMITS.tagLength,
  },
  extraTags: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.extraTagsCount,
  },
  'extraTags.$': {
    type: Object,
  },
  'extraTags.$._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue(){
      if (!this.isSet) return Random.id();
    }
  },
  'extraTags.$.operation': {
    type: String,
    allowedValues: ['OR', 'NOT'],
    defaultValue: 'OR',
  },
  'extraTags.$.tags': {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.tagCount,
  },
  'extraTags.$.tags.$': {
    type: String,
    max: STORAGE_LIMITS.tagLength,
  },
});

const ComputedOnlyEffectSchema = createPropertySchema({
  amount: {
    type: 'computedOnlyField',
    optional: true,
  },
});

const ComputedEffectSchema = new SimpleSchema()
  .extend(ComputedOnlyEffectSchema)
  .extend(EffectSchema);

export { EffectSchema, ComputedEffectSchema, ComputedOnlyEffectSchema };
