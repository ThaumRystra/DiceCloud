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
});

Proficiencies.attachSchema(Schemas.Proficiency);

Proficiencies.attachBehaviour('softRemovable');
makeChild(Proficiencies);

Proficiencies.allow(CHARACTER_SUBSCHEMA_ALLOW);
Proficiencies.deny(CHARACTER_SUBSCHEMA_DENY);
