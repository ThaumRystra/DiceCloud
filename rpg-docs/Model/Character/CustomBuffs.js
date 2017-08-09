CustomBuffs = new Mongo.Collection("customBuffs");

Schemas.CustomBuff = new SimpleSchema({
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
		autoValue: function(){
			return false;
			//enabled is ALWAYS false on these, so that its children are also not enabled, so that the buff templates have no effects.
		},
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
	color: {
		type: String,
		allowedValues: _.pluck(colorOptions, "key"),
		defaultValue: "q",
	},
	//the id of the feature, buff or item that creates this buff
	parent: {
		type: Schemas.Parent,
		optional: true,
	},
});

CustomBuffs.attachSchema(Schemas.CustomBuff);

CustomBuffs.attachBehaviour("softRemovable");
makeParent(CustomBuffs, ["name", "enabled"]); //parents of effects, attacks, proficiencies. Since this represents a template, "enabled" is always false.
makeChild(CustomBuffs, ["enabled"]); //children of lots of things

CustomBuffs.allow(CHARACTER_SUBSCHEMA_ALLOW);
CustomBuffs.deny(CHARACTER_SUBSCHEMA_DENY);
