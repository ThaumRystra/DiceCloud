import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import AdjustmentSchema from '/imports/api/creature/subSchemas/AdjustmentSchema.js';
import StoredBuffSchema from '/imports/api/creature/properties/Buffs.js';
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'
import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';

// Mixins
import creaturePermissionMixin from '/imports/api/creature/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/creature/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/creature/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/creature/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/creature/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/creature/mixins/updateSchemaMixin.js';

let Actions = new Mongo.Collection('actions');

/*
 * Actions are things a character can do
 * Any rolls that are children of actions will be rolled when taking the action
 * Any actions that are children of this action will be considered alternatives
 * to this action
 */
let ActionSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	enabled: {
    type: Boolean,
    defaultValue: true,
  },
	description: {
		type: String,
		optional: true,
	},
	// What time-resource is used to take the action in combat
	// long actions take longer than 1 round to cast
	type: {
		type: String,
		allowedValues: ['action', 'bonus', 'attack', 'reaction', 'free', 'long'],
		defaultValue: 'action',
	},
	// Who is the action directed at
	target: {
		type: String,
		allowedValues: [
      'self',
      'singleTarget',
			'multipleTargets',
    ],
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
	// Buffs applied when taking this action
	buffs: {
		type: Array,
		defaultValue: [],
	},
	'buffs.$': {
		type: StoredBuffSchema,
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

ActionSchema.extend(ColorSchema);

Actions.attachSchema(ActionSchema);
Actions.attachSchema(PropertySchema);

const insertAction = new ValidatedMethod({
  name: 'Actions.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
		setDocToLastMixin,
    simpleSchemaMixin,
  ],
  collection: Actions,
  permission: 'edit',
  schema: ActionSchema,
  run(action) {
		return Actions.insert(action);
  },
});

const updateAction = new ValidatedMethod({
  name: 'Actions.methods.update',
  mixins: [
    propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Actions,
  permission: 'edit',
  schema: ActionSchema,
});

export default Actions;
export { ActionSchema, insertAction, updateAction };
