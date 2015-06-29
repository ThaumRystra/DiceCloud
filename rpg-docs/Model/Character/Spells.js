Spells = new Mongo.Collection("spells");

Schemas.Spell = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id},
	prepared: {
		type: String,
		defaultValue: "prepared",
		allowedValues: ["prepared", "unprepared", "always"],
	},
	name: {
		type: String,
		trim: false,
		defaultValue: "New Spell",
	},
	description: {
		type: String,
		optional: true,
		trim: false,
	},
	castingTime: {
		type: String,
		optional: true,
		defaultValue: "action",
		trim: false,
	},
	range: {
		type: String,
		optional: true,
		trim: false,
	},
	duration: {
		type: String,
		optional: true,
		trim: false,
		defaultValue: "Instantaneous",
	},
	"components.verbal":        {type: Boolean, defaultValue: false},
	"components.somatic":       {type: Boolean, defaultValue: false},
	"components.concentration":	{type: Boolean, defaultValue: false},
	"components.material":      {type: String, optional: true},
	ritual:      {
		type: Boolean,
		defaultValue: false,
	},
	level:       {
		type: Number,
		defaultValue: 1,
	},
	school:      {
		type: String,
		defaultValue: "Abjuration",
		allowedValues: magicSchools,
	},
	color:       {
		type: String,
		allowedValues: _.pluck(colorOptions, "key"),
		defaultValue: "q",
	},
});

Spells.attachSchema(Schemas.Spell);

Spells.attachBehaviour("softRemovable");
makeChild(Spells); //children of spell lists
makeParent(Spells, ["name", "enabled"]); //parents of attacks

Spells.allow(CHARACTER_SUBSCHEMA_ALLOW);
Spells.deny(CHARACTER_SUBSCHEMA_DENY);
