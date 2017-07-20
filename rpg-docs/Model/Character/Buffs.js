Buffs = new Mongo.Collection("buffs");

Schemas.Buff = new SimpleSchema({
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
	enabled: {
		type: Boolean,
		defaultValue: true,
	},
	type: {
		type: String,
		allowedValues: [
			"inate", //this should be "innate", but changing it could be problematic
			"custom",
		],
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
	//the id of the feature, buff or item that created this buff
	parent: {
		type: Schemas.Parent,
		optional: true,
	},
});

Buffs.attachSchema(Schemas.Buff);

Buffs.attachBehaviour("softRemovable");
makeParent(Buffs, ["name", "enabled"]); //parents of effects, attacks, proficiencies
makeChild(Buffs, ["enabled"]); //children of lots of things //perhaps make "enabled" no longer a child now that we can individually toggle buffs?

Buffs.allow(CHARACTER_SUBSCHEMA_ALLOW);
Buffs.deny(CHARACTER_SUBSCHEMA_DENY);
