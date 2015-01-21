/*
 * Effects are reason-value attached to skills and abilities
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
		allowedValues: ["base", "proficiency","add","mul","min","max","advantage","disadvantage","passiveAdd","fail","conditional"]
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
		defaultValue: "editable",
		allowedValues: ["editable", "feature", "buff", "equipment", "inate"]
	},
	//which stat the effect is applied to
	stat: {
		type: String,
		optional: true
	}
});