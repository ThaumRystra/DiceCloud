/*
 * Effects are reason-value pairs attached to skills and abilities
 * that modify their final value or presentation in some way
 */
Schemas.Effect = new SimpleSchema({
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
	operation: {
		type: String,
		defaultValue: "add",
		allowedValues: ["proficiency","add","mul","min","max","advantage","disadvantage","passiveAdd","fail","conditional","passiveAdd"]
	},
	value: {
		type: Number,
		decimal: true,
		optional: true
	},
	calculation: {
		type: String,
		optional: true
	},
	//indicates what the effect originated from
	type: {
		type: String,
		defaultValue: "default",
		allowedValues: ["default", "inate", "class", "race", "feat", "equippedMagic", "equippedMundane", "external"]
	}
});