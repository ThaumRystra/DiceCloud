Proficiencies = new Mongo.Collection("proficiencies");

Schemas.Proficiency = new SimpleSchema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id
	},
	name: {
		type: String,
		trim: false
	},
	value: {
		type: Number,
		allowedValues: [0, 0.5, 1],
	},
	type: {
		type: String,
		allowedValues: ["skill", "save", "weapon", "armor", "tool", "language"]
	}
});

Proficiencies.attachSchema(Schemas.Proficiency);

Proficiencies.attachBehaviour('softRemovable');
makeChild(Proficiencies);

Proficiencies.allow(CHARACTER_SUBSCHEMA_ALLOW);
Proficiencies.deny(CHARACTER_SUBSCHEMA_DENY);
