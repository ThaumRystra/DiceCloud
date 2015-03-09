Attacks = new Meteor.Collection("attacks");

/*
 * Attacks are given to a character by items and features
 */
Schemas.Attack = new SimpleSchema({
	charId: {
		type: String, 
		regEx: SimpleSchema.RegEx.Id
	},
	name: {
		type: String,
		defaultValue: "New Attack", 
		trim: false
	},
	details: {
		type: String,
		optional: true, 
		trim: false
	},
	attackBonus: {
		type: String,
		defaultValue: "strengthMod + proficiencyBonus",
		optional: true, 
		trim: false
	},
	damageBonus: {
		type: String,
		defaultValue: "strengthMod",
		optional: true, 
		trim: false
	},
	damageDice: {
		type: String,
		optional: true,
		defaultValue: "1d8",
		allowedValues: DAMAGE_DICE
	},
	damageType: {
		type: String,
		allowedValues: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "force", "lightning", "necrotic", 
						"poison", "psychic", "radiant", "thunder"],
		defaultValue: "slashing"
	},
	//indicates what the attack originated from
	type: {
		type: String,
		defaultValue: "editable",
		allowedValues: ["editable", "feature", "class", "buff", "equipment", "racial", "inate"]
	},
	//the id of the feature, buff or item that created this effect
	sourceId: {
		type: String, 
		regEx: SimpleSchema.RegEx.Id,
		optional: true
	},
	color: {
		type: String, 
		allowedValues: _.pluck(colorOptions, "key"), 
		defaultValue: "q"
	},
	enabled: {
		type: Boolean,
		defaultValue: true
	}
});

Attacks.attachSchema(Schemas.Attack);
