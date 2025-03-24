import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const BuffRemoverSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // This will remove just the nearest ancestor buff 
  targetParentBuff: {
    type: Boolean,
    optional: true,
  },
  // The following only applies when not targeting the parent buff
  // Which character to remove buffs from
  target: {
    type: String,
    allowedValues: [
      'self',
      'target',
    ],
    defaultValue: 'target',
  },
  // remove 1 or remove all
  removeAll: {
    type: Boolean,
    optional: true,
    defaultValue: true,
  },
  // Buffs to remove based on tags:
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
    autoValue() {
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
  // Prevent the property from showing up in the log
  silent: {
    type: Boolean,
    optional: true,
  },
});

const ComputedOnlyBuffRemoverSchema = createPropertySchema({});

const ComputedBuffRemoverSchema = TypedSimpleSchema.from({})
  .extend(BuffRemoverSchema)
  .extend(ComputedOnlyBuffRemoverSchema);

export { BuffRemoverSchema, ComputedOnlyBuffRemoverSchema, ComputedBuffRemoverSchema };
