import SimpleSchema from 'simpl-schema';

let ProficiencySchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
	},
	// The variableNames of the skills, tags, or attributes to apply proficiency to
	stats: {
		type: Array,
		defaultValue: [],
	},
	'stats.$': {
		type: String,
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
