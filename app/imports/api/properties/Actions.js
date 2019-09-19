import SimpleSchema from 'simpl-schema';
import AdjustmentSchema from '/imports/api/properties/subSchemas/AdjustmentSchema.js';
import DamageSchema from '/imports/api/properties/subSchemas/DamageSchema.js';
import { StoredBuffWithIdSchema } from '/imports/api/properties/Buffs.js';

/*
 * Actions are things a character can do
 * Any rolls that are children of actions will be rolled when taking the action
 * Any actions that are children of this action will be considered alternatives
 * to this action
 */
let ActionSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
	// What time-resource is used to take the action in combat
	// long actions take longer than 1 round to cast
	actionType: {
		type: String,
		allowedValues: ['action', 'bonus', 'attack', 'reaction', 'free', 'long'],
		defaultValue: 'action',
	},
	// Who is the action directed at
	target: {
		type: String,
		defaultValue: 'singleTarget',
		allowedValues: [
      'self',
      'singleTarget',
			'multipleTargets',
    ],
	},
	// Effects can apply to this tag specifically
  // Ranged spell attack, Ranged weapon attack, etc.
  tags: {
    type: Array,
    defaultValue: [],
  },
  'tags.$': {
    type: String,
  },
	// Adjustments applied when taking this action
	// Ideally, if these adjustments can't be made, the action should be unusable
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
	// Buffs applied when taking this action
	buffs: {
		type: Array,
		defaultValue: [],
	},
	'buffs.$': {
		type: StoredBuffWithIdSchema,
	},
	// Calculation of how many times this action can be used
	// Only set if this action tracks its own uses, rather than adjusting
	// resources
	uses: {
		type: String,
		optional: true,
	},
	// Integer of how many times it has already been used
	usesUsed: {
		type: SimpleSchema.Integer,
		optional: true,
	},
	// How this action's uses are reset automatically
	reset: {
		type: String,
		allowedValues: ["longRest", "shortRest"],
		optional: true,
	},
});

export { ActionSchema };
