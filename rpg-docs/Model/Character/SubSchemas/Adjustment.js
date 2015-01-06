/*
 * Adjustments make instantaneous changes to the value of some attribute
 * Damage, healing and resource cost/recovery are all adjustments
 */
Schemas.Adjustment = new SimpleSchema({
	name: {
		type: String,
		optional: true
	},
	//which stat the adjustment is applied to
	stat: {
		type: String,
		optional: true
	},
	//the value added to the stat
	value: {
		type: Number,
		decimal: true,
		optional: true
	},
	calculation: {
		type: String,
		optional: true
	}
});