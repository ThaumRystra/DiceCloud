/*
 * A buff becomes an effect when applied on a creature.
 * It is the effect plus the stat to which it should be applied
 */
Schemas.Buff = new SimpleSchema({
	stat: {
		type: String
	},
	effect: {
		type: Schemas.Effect
	}
});

Buff = function(name, stat, value){
	this.stat = stat;
	this.effect = new Effect(name, value);
};