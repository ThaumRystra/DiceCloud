import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

let Proficiencies = new Mongo.Collection("proficiencies");

let ProficiencySchema = schema({
	name: {
		type: String,
		trim: false,
		optional: true,
	},
	// A number representing how proficient the character is
	value: {
		type: Number,
		allowedValues: [0, 0.5, 1, 2],
		defaultValue: 1,
	},
	// The variableName of the skill to apply this to
	skill: {
		type: String,
		optional: true,
	},
});

Proficiencies.attachSchema(ProficiencySchema);
Proficiencies.attachSchema(PropertySchema);
Proficiencies.attachSchema(ChildSchema);

export default Proficiencies;
export { ProficiencySchema };
