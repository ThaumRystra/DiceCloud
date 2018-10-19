import SimpleSchema from 'simpl-schema';

Proficiencies = new Mongo.Collection("proficiencies");

proficiencySchema = new SimpleSchema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
	},
	name: {
		type: String,
		trim: false,
		optional: true,
	},
	value: {
		type: Number,
		allowedValues: [0, 0.5, 1, 2],
		defaultValue: 1,
	},
	type: {
		type: String,
		allowedValues: ["skill", "save", "weapon", "armor", "tool", "language"],
		defaultValue: "skill",
	},
	enabled: {
		type: Boolean,
		defaultValue: true,
	},
});

Proficiencies.attachSchema(proficiencySchema);

// Proficiencies.attachBehaviour("softRemovable");
makeChild(Proficiencies, ["enabled"]);
