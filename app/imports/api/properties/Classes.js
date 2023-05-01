import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';

// Classes are like slots, except they only take class levels and enforce that
// lower levels are taken before higher levels
let ClassSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: 'inlineCalculationFieldToCompute',
    optional: true,
  },
  // Only `classLevel`s with the same variable name can fill the class
  variableName: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  slotTags: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.tagCount,
  },
  'slotTags.$': {
    type: String,
    max: STORAGE_LIMITS.tagLength,
  },
  extraTags: {
    type: Array,
    defaultValue: [],
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
  slotCondition: {
    type: 'fieldToCompute',
    optional: true,
  },
});

const ComputedOnlyClassSchema = createPropertySchema({
  // Computed fields
  description: {
    type: 'computedOnlyInlineCalculationField',
    optional: true,
  },
  slotCondition: {
    type: 'computedOnlyField',
    optional: true,
  },
  
  // Denormalized fields
  level: {
    type: SimpleSchema.Integer,
    optional: true,
    removeBeforeCompute: true,
  },
  missingLevels: {
    type: Array,
    optional: true,
    removeBeforeCompute: true,
  },
  'missingLevels.$': {
    type: SimpleSchema.Integer,
  },
});

const ComputedClassSchema = new SimpleSchema()
  .extend(ClassSchema)
  .extend(ComputedOnlyClassSchema);

export { ClassSchema, ComputedOnlyClassSchema, ComputedClassSchema };
