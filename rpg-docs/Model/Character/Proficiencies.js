Proficiencies = new Mongo.Collection("proficiencies");

Schemas.Proficiency = new SimpleSchema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
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
		decimal: true,
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

Proficiencies.attachSchema(Schemas.Proficiency);

Proficiencies.attachBehaviour("softRemovable");
makeChild(Proficiencies, ["enabled"]);

Proficiencies.allow(CHARACTER_SUBSCHEMA_ALLOW);
Proficiencies.deny(CHARACTER_SUBSCHEMA_DENY);
