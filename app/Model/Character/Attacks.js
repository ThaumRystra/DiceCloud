Attacks = new Mongo.Collection("attacks");

/*
 * Attacks are given to a character by items and features
 */
Schemas.Attack = new SimpleSchema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
	},
	name: {
		type: String,
		defaultValue: "New Attack",
		optional: true,
		trim: false,
	},
	details: {
		type: String,
		optional: true,
		trim: false,
	},
	attackBonus: {
		type: String,
		defaultValue: "strengthMod + proficiencyBonus",
		optional: true,
		trim: false,
	},
	damage: {
		type: String,
		defaultValue: "1d8 + {strengthMod}",
		optional: true,
		trim: false,
	},
	damageType: {
		type: String,
		allowedValues: [
			"bludgeoning",
			"piercing",
			"slashing",
			"acid",
			"cold",
			"fire",
			"force",
			"lightning",
			"necrotic",
			"poison",
			"psychic",
			"radiant",
			"thunder",
			"magicbludgeoning",
			"magicpiercing",
			"magicslashing",
		],
		defaultValue: "slashing",
	},
	//the id of the feature, buff or item that created this effect
	parent: {
		type: Schemas.Parent
	},
	color: {
		type: String,
		allowedValues: _.pluck(colorOptions, "key"),
		defaultValue: "q",
	},
	enabled: {
		type: Boolean,
		defaultValue: true,
	},
});

Attacks.attachSchema(Schemas.Attack);

Attacks.attachBehaviour("softRemovable");
makeChild(Attacks, ["name", "enabled"]); //children of lots of things

Attacks.after.insert(function (userId, attack) {
	//Check to see if this attack's parent is a spell, if so, mirror prepared state to enabled
	if (attack.parent.collection === "Spells") {
		var parentSpell = Spells.findOne(attack.parent.id);
		if (parentSpell.prepared === "unprepared") {
			Attacks.update(attack._id, {$set: {enabled: false}});
		} else if (parentSpell.prepared === "prepared" || "always") {
			Attacks.update(attack._id, {$set: {enabled: true}});
		}
	}
});

Attacks.allow(CHARACTER_SUBSCHEMA_ALLOW);
Attacks.deny(CHARACTER_SUBSCHEMA_DENY);
