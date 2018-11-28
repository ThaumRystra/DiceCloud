import SimpleSchema from 'simpl-schema';
import {makeChild} from "/imports/api/parenting.js";

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
		type: Array,
		defaultValue: [],
	},
	"adjustments.$": {
		type: Object,
	},
});

Actions.attachSchema(actionSchema);

// Actions.attachBehaviour("softRemovable");
makeChild(Actions);

export default Actions
