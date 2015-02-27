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
	range: {
		type: String,
		optional: true, 
		trim: false
	},
	attackBonus: {
		type: String,
		optional: true,
		defaultValue: "strengthMod + proficiencyBonus",
		trim: false
	},
	damage: {
		type: String,
		optional: true,
		defaultValue: "1d8 + {strengthMod}",
		trim: false
	},
	damageType: {
		type: String,
		allowedValues: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "force", "lightning", "necrotic", 
						"poison", "psychic", "radiant", "thunder"],
		defaultValue: "slashing"
	},
	color: {
		type: String, 
		allowedValues: _.pluck(colorOptions, "key"), 
		defaultValue: "q"
	}
});

Attacks.attachSchema(Schemas.Attack);
