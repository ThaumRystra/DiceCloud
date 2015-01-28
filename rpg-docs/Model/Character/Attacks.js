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
		type: String
	},
	range: {
		type: String,
		optional: true
	},
	attackBonus: {
		type: String,
		optional: true
	},
	damage: {
		type: String
	},
	damageType: {
		type: String,
		allowedValues: ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", 
						"piercing", "poison", "psychic", "radiant", "slashing", "thunder"] 
	}
});

Attacks.attachSchema(Schemas.Attack);
