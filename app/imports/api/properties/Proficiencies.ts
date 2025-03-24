import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import TagTargetingSchema from '/imports/api/properties/subSchemas/TagTargetingSchema';

const ProficiencySchema = createPropertySchema({
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
}).extend(TagTargetingSchema);

const ComputedOnlyProficiencySchema = createPropertySchema({});

export { ProficiencySchema, ComputedOnlyProficiencySchema };
