/*
 * Actions are given to a character by items and features
 */
Schemas.Action = new SimpleSchema({
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
	description: {
		type: String
	},
	type: {
		type: String,
		allowedValues: ["action, bonus, reaction, free"],
		defaultValue: "action"
	},
	selfBuffs: {
		type: [Schemas.Buff], defaultValue: []
	},
	selfAdjustments: {
		type: [Schemas.Adjustment], defaultValue: []
	}
});