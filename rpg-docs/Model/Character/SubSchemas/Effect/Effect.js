/*
 * Effects are reason-value pairs attached to skills and abilities
 * that modify their final value or presentation in some way
 */
Schemas.Effect = new SimpleSchema({
	_id: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function(){
			if(!isSet) return Random.id();
		}
	},
	name: {
		type: String
	},
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

Effect = function(name, value){
	this._id = Random.id();
	this.name = name;
	if (typeof value === "string"){
		this.calculation = value;
	} else if (typeof valye === "number"){
		this.value = value;
	}
};