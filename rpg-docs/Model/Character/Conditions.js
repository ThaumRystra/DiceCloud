Conditions = new Mongo.Collection("conditions");

Schemas.Conditions = new SimpleSchema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
	},
	name: {
		type: String,
		optional: true,
		trim: false,
	},
	description: {
		type: String,
		optional: true,
		trim: false,
	},
	"lifeTime.total": {
		type: Number,
		defaultValue: 0, //0 is infinite
		min: 0,
	},
	"lifeTime.spent": {
		type: Number,
		defaultValue: 0,
		min: 0,
	},
	color: {
		type: String,
		allowedValues: _.pluck(colorOptions, "key"),
		defaultValue: "q",
	},
});

Conditions.attachSchema(Schemas.Conditions);

Conditions.attachBehaviour("softRemovable");
makeParent(Conditions, ["name"]); //parents of effects, attacks, proficiencies

Conditions.allow(CHARACTER_SUBSCHEMA_ALLOW);
Conditions.deny(CHARACTER_SUBSCHEMA_DENY);
