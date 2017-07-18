Spells = new Mongo.Collection("spells");

Schemas.Spell = new SimpleSchema({
	charId:      {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	prepared: {
		type: String,
		defaultValue: "prepared",
		allowedValues: ["prepared", "unprepared", "always"],
	},
	name: {
		type: String,
		optional: true,
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

Spells.after.update(function (userId, spell, fieldNames) {
	//Update prepared state of spell and child attacks to be enabled or not
	if (_.contains(fieldNames, "prepared")) {
		var childAttacks = Attacks.find({"parent.id": spell._id}).fetch();
		if (spell.prepared === "unprepared") {
			_.each(childAttacks, function(attack){
				Attacks.update(attack._id, {$set: {enabled: false}});
			});
		} else if (spell.prepared === "prepared" || "always") {
			_.each(childAttacks, function(attack){
				Attacks.update(attack._id, {$set: {enabled: true}});
			});
		}
	}
});

Spells.allow(CHARACTER_SUBSCHEMA_ALLOW);
Spells.deny(CHARACTER_SUBSCHEMA_DENY);
