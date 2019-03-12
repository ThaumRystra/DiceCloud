import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';

let DamageMultipliers = new Mongo.Collection("damageMultipliers");

/*
 * DamageMultipliers are multipliers that affect
 */
let DamageMultiplierSchema = schema({
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

export default DamageMultipliers;
export { DamageMultiplierSchema };
