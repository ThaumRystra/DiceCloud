import schema from '/imports/api/schema.js';
import AdjustmentSchema from '/imports/api/creature/subSchemas/AdjustmentSchema.js';
import DamageSchema from '/imports/api/creature/subSchemas/DamageSchema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

let Actions = new Mongo.Collection('actions');

/*
 * Actions are given to a character by items and features
 */
let actionSchema = schema({
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
Actions.attachSchema(PropertySchema);
Actions.attachSchema(ChildSchema);

// makeChild(Actions, ["name", "enabled"]);

export default Actions
