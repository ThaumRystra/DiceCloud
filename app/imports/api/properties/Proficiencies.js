import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

let ProficiencySchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // The variableNames of the skills, tags, or attributes to apply proficiency to
  stats: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.statsToTarget,
  },
  'stats.$': {
    type: String,
    max: STORAGE_LIMITS.variableName,
  },
  // A number representing how proficient the character is
  // where 0.49 is half rounded down and 0.5 is half rounded up
  value: {
    type: Number,
    allowedValues: [0.49, 0.5, 1, 2],
    defaultValue: 1,
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
  // Which tags the proficiency is applied to
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
});

const ComputedOnlyProficiencySchema = new SimpleSchema({});

export { ProficiencySchema, ComputedOnlyProficiencySchema };
