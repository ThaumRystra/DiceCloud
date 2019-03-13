import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';

// Mixins
import recomputeCreatureMixin from '/imports/api/creature/recomputeCreatureMixin.js';
import { creaturePermissionMixin } from '/imports/api/creature/creaturePermissions.js';
import { setDocToLastMixin } from '/imports/api/order.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/simpleSchemaMixin.js';

let DamageMultipliers = new Mongo.Collection("damageMultipliers");

/*
 * DamageMultipliers are multipliers that affect how much damage is taken from
 * a given damage type
 */
let DamageMultiplierSchema = schema({
  name: {
		type: String,
		optional: true,
	},
  // The technical, lowercase, single-word name used in formulae
  damageType: {
    type: String,
		allowedValues: DAMAGE_TYPES,
  },
	// The value of the damage multiplier
	value: {
    type: Number,
		defaultValue: 1,
		allowedValues: [0, 0.5, 1, 2],
  },
});

DamageMultipliers.attachSchema(DamageMultiplierSchema);
DamageMultipliers.attachSchema(PropertySchema);
DamageMultipliers.attachSchema(ChildSchema);

const insertDamageMultiplier = new ValidatedMethod({
  name: 'DamageMultipliers.methods.insert',
	mixins: [
    creaturePermissionMixin,
    setDocToLastMixin,
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
    recomputeCreatureMixin,
    simpleSchemaMixin,
  ],
  collection: DamageMultipliers,
  permission: 'edit',
  schema: DamageMultiplierSchema,
  run(dm) {
		return DamageMultipliers.insert(dm);
  },
});

const updateDamageMultiplier = new ValidatedMethod({
  name: 'DamageMultipliers.methods.update',
  mixins: [
    creaturePermissionMixin,
    recomputeCreatureMixin,
    simpleSchemaMixin,
  ],
  collection: DamageMultipliers,
  permission: 'edit',
  schema: new SimpleSchema({
    _id: SimpleSchema.RegEx.Id,
    update: DamageMultiplierSchema.omit('name'),
  }),
  run({_id, update}) {
		return DamageMultipliers.update(_id, {$set: update});
  },
});

export default DamageMultipliers;
export { DamageMultiplierSchema, insertDamageMultiplier, updateDamageMultiplier };
