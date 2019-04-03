import SimpleSchema from 'simpl-schema';
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'
import AdjustmentSchema from '/imports/api/creature/subSchemas/AdjustmentSchema.js';
import StoredBuffSchema from '/imports/api/creature/properties/Buffs.js';

// Mixins
import creaturePermissionMixin from '/imports/api/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/mixins/updateSchemaMixin.js';

let Rolls = new Mongo.Collection('rolls');

let RollChildrenSchema = new SimpleSchema({
  // The adjustments to be applied
  adjustments: {
		type: Array,
		defaultValue: [],
	},
	'adjustments.$': {
		type: AdjustmentSchema,
	},
  // The buffs to be applied
  buffs: {
		type: Array,
		defaultValue: [],
	},
	'buffs.$': {
		type: StoredBuffSchema,
	},
});

/**
 * Rolls are children to actions or other rolls, they are triggered with 0 or
 * more targets and then apply their results to the character taking the action
 * or the target of the action.
 *
 * # Rolls are resolved in one of two ways:
 * Regular rolls:
 * The target number is computed in the target's context
 * The roll is computed in the action taker's context
 * If the roll meets or exceeds the target number, the adjustments and buffs
 * are applied
 *
 * Saving throws:
 * The target number is computed in the action taker's context
 * The roll is computed in the target's context
 * If the roll fails to meet or exceed the target number, the adjustments and
 *  child rolls are applied
 */
let RollSchema = new SimpleSchema({
  // Apply this only if the parent roll missed
  // i.e. roll failed or target suceeded on their save
  onMiss: {
    type: Boolean,
    optional: true,
  },
  // The target number to meet or exceed
  targetNumber: {
		type: String,
    optional: true,
	},
  // Swap who wins ties
  invertTies: {
    type: Boolean,
    optional: true,
  },
  // Is this roll a saving throw
  isSavingThrow: {
    type: Boolean,
    optional: true,
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
  // The roll made against the target value. A calculation that resolves to a
  // number or a roll. If it is a number, it will be added to a d20 roll
  roll: {
    type: String,
    optional: true,
  },
  // The buffs and adjustments to apply based on the outcome of the roll
  hit: RollChildrenSchema,
  miss: RollChildrenSchema,
});

Rolls.attachSchema(RollSchema);
Rolls.attachSchema(PropertySchema);

const insertRoll = new ValidatedMethod({
  name: 'Rolls.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocToLastMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
    simpleSchemaMixin,
  ],
  collection: Rolls,
  permission: 'edit',
  schema: RollSchema,
  run(roll) {
		return Rolls.insert(roll);
  },
});

const updateRoll = new ValidatedMethod({
  name: 'Rolls.methods.update',
  mixins: [
    propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: Rolls,
  permission: 'edit',
  schema: RollSchema,
});

export default Rolls;
export { RollSchema, insertRoll, updateRoll };
