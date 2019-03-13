import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import AdjustmentSchema from '/imports/api/creature/subSchemas/AdjustmentSchema.js';
import StoredBuffSchema from '/imports/api/creature/properties/Buffs.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import ColorSchema from '/imports/api/creature/subSchemas/ColorSchema.js';

// Mixins
import { creaturePermissionMixin } from '/imports/api/creature/creaturePermissions.js';
import { setDocToLastMixin } from '/imports/api/order.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/simpleSchemaMixin.js';


let Actions = new Mongo.Collection('actions');

/*
 * Actions are things a character can do
 */
let ActionSchema = schema({
	name: {
		type: String,
		optional: true,
	},
	description: {
		type: String,
		optional: true,
	},
	// What time-resource is used to take the action in combat
	type: {
		type: String,
		allowedValues: ['attack', 'action', 'bonus', 'reaction', 'free'],
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
	// Adjustments applied when taking this action, regardless of roll outcomes
	// If these adjustments can't be made, the action should be unusable
	adjustments: {
		type: Array,
		defaultValue: [],
	},
	'adjustments.$': {
		type: AdjustmentSchema,
	},
	// Buffs applied when taking this action, regardless of roll outcomes
	buffs: {
		type: Array,
		defaultValue: [],
	},
	'buffs.$': {
		type: StoredBuffSchema,
	},
	// Calculation of how many times this action can be used
	// Only set if this action tracks its own uses
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
Actions.attachSchema(ChildSchema);

const insertAction = new ValidatedMethod({
  name: 'Actions.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocToLastMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
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
    creaturePermissionMixin,
    simpleSchemaMixin,
  ],
  collection: Actions,
  permission: 'edit',
  schema: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id,
    update: ActionSchema.omit('name'),
  }),
  run({_id, update}) {
		return Actions.update(_id, {$set: update});
  },
});

export default Actions;
export { ActionSchema, insertAction, updateAction };
