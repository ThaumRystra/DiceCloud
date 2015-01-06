/*
 * Attacks are given to a character by items and features
 */
Schemas.Attack = new SimpleSchema({
	_id: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function(){
			if(!this.isSet) return Random.id();
		}
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