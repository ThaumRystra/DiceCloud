import SimpleSchema from 'simpl-schema';
import ResultsSchema from '/imports/api/properties/subSchemas/ResultsSchema.js';

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
  tags: {
    type: Array,
    defaultValue: [],
  },
  'tags.$': {
    type: String,
  },
	results: {
		type: ResultsSchema,
		defaultValue: {},
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
