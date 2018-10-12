import SimpleSchema from 'simpl-schema';

let Actions = new Mongo.Collection("actions");

/*
 * Actions are given to a character by items and features
 */
let actionSchema = new SimpleSchema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
	},
	name: {
		type: String,
		optional: true,
		trim: false,
	},
	description: {
		type: String,
		optional: true,
		trim: false,
	},
	type: {
		type: String,
		allowedValues: ["action, bonus, reaction, free"],
		defaultValue: "action",
	},
	//the immediate impact of doing this action (eg. -1 rages)
	adjustments: {
		type: [Schemas.Adjustment],
		defaultValue: [],
	},
});

Actions.attachSchema(actionSchema);

Actions.attachBehaviour("softRemovable");
makeChild(Actions);

Actions.allow(CHARACTER_SUBSCHEMA_ALLOW);
Actions.deny(CHARACTER_SUBSCHEMA_DENY);

export default Actions
