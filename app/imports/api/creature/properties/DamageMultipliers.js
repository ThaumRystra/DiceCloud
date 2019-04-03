import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import { PropertySchema } from '/imports/api/creature/properties/Properties.js'
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';

// Mixins
import recomputeCreatureMixin from '/imports/api/mixins/recomputeCreatureMixin.js';
import creaturePermissionMixin from '/imports/api/mixins/creaturePermissionMixin.js';
import { setDocToLastMixin } from '/imports/api/mixins/setDocToLastMixin.js';
import { setDocAncestryMixin, ensureAncestryContainsCharIdMixin } from '/imports/api/parenting/parenting.js';
import simpleSchemaMixin from '/imports/api/mixins/simpleSchemaMixin.js';
import propagateInheritanceUpdateMixin from '/imports/api/mixins/propagateInheritanceUpdateMixin.js';
import updateSchemaMixin from '/imports/api/mixins/updateSchemaMixin.js';

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

const insertDamageMultiplier = new ValidatedMethod({
  name: 'DamageMultipliers.methods.insert',
	mixins: [
    setDocAncestryMixin,
    ensureAncestryContainsCharIdMixin,
    recomputeCreatureMixin,
    setDocToLastMixin,
    simpleSchemaMixin,
    creaturePermissionMixin,
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
    recomputeCreatureMixin,
    propagateInheritanceUpdateMixin,
    updateSchemaMixin,
    creaturePermissionMixin,
  ],
  collection: DamageMultipliers,
  permission: 'edit',
  schema: DamageMultiplierSchema,
});

export default DamageMultipliers;
export { DamageMultiplierSchema, insertDamageMultiplier, updateDamageMultiplier };
