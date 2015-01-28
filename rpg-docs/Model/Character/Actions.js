Actions = new Meteor.Collection("actions");

/*
 * Actions are given to a character by items and features
 */
Schemas.Action = new SimpleSchema({
	charId: {
		type: String, 
		regEx: SimpleSchema.RegEx.Id
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
	//the immediate impact of doing this action (eg. -1 rages)
	adjustments: {
		type: [Schemas.Adjustment], defaultValue: []
	}
});

Actions.attachSchema(Schemas.Action);
