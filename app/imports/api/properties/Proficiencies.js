import SimpleSchema from 'simpl-schema';

let ProficiencySchema = new SimpleSchema({
	// The variableName of the skill to apply this to
	skill: {
		type: String,
		optional: true,
	},
	// A number representing how proficient the character is
	value: {
		type: Number,
		allowedValues: [0.5, 1, 2],
		defaultValue: 1,
	},
});

export { ProficiencySchema };
