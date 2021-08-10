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
});

export { ProficiencySchema };
