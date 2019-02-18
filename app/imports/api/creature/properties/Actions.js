import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import {makeChild} from '/imports/api/parenting.js';
import AdjustmentSchema from '/imports/api/creature/subSchemas/AdjustmentSchema.js';
import DamageSchema from '/imports/api/creature/subSchemas/DamageSchema.js';

let Actions = new Mongo.Collection('actions');

/*
 * Actions are given to a character by items and features
 */
let actionSchema = schema({
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
	enabled: {
		type: Boolean,
		defaultValue: true,
	},
	description: {
		type: String,
		optional: true,
		trim: false,
	},
	type: {
		type: String,
		allowedValues: ['action', 'bonus', 'reaction', 'free'],
		defaultValue: 'action',
	},
	//the immediate impact of doing this action (eg. -1 rages)
	adjustments: {
		type: Array,
		defaultValue: [],
	},
	'adjustments.$': {
		type: AdjustmentSchema,
	},
	damages: {
		type: Array,
		defaultValue: [],
	},
	'damages.$': {
		type: DamageSchema,
	},
});

Actions.attachSchema(actionSchema);

// Actions.attachBehaviour('softRemovable');
makeChild(Actions, ["name", "enabled"]);

export default Actions
