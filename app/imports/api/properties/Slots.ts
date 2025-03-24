import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const SlotSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: 'inlineCalculationFieldToCompute' as const,
    optional: true,
  },
  slotType: {
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
    max: 32,
    autoValue() {
      if (!this.isSet) return Random.id();
    }
  },
  'extraTags.$.operation': {
    type: String,
    allowedValues: ['OR', 'NOT'] as const,
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
  quantityExpected: {
    type: 'fieldToCompute' as const,
    optional: true,
    defaultValue: '1',
  },
  ignored: {
    type: Boolean,
    optional: true,
  },
  slotCondition: {
    type: 'fieldToCompute' as const,
    optional: true,
  },
  hideWhenFull: {
    type: Boolean,
    optional: true,
    defaultValue: true,
  },
  unique: {
    type: String,
    allowedValues: [
      // Can't choose the same slot filler twice in this slot
      'uniqueInSlot',
      // Can't choose the same slot filler twice across the whole creature
      'uniqueInCreature'
    ] as const,
    optional: true,
    defaultValue: 'uniqueInSlot',
  },
});

const ComputedOnlySlotSchema = createPropertySchema({
  // Computed fields
  description: {
    type: 'computedOnlyInlineCalculationField' as const,
    optional: true,
  },
  quantityExpected: {
    type: 'computedOnlyField' as const,
    optional: true,
  },
  slotCondition: {
    type: 'computedOnlyField' as const,
    optional: true,
  },

  // Denormalised fields
  totalFilled: {
    type: SimpleSchema.Integer,
    defaultValue: 0,
    removeBeforeCompute: true,
  },
  spaceLeft: {
    type: SimpleSchema.Integer,
    optional: true,
    removeBeforeCompute: true,
  },
});

const ComputedSlotSchema = TypedSimpleSchema.from({})
  .extend(ComputedOnlySlotSchema)
  .extend(SlotSchema);

export { SlotSchema, ComputedSlotSchema, ComputedOnlySlotSchema };
