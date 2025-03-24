import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const TagTargetingSchema = TypedSimpleSchema.from({
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
});

export default TagTargetingSchema;
