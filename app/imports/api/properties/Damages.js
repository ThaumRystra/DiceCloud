import SimpleSchema from 'simpl-schema';
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';

const DamageSchema = new SimpleSchema({
	// The roll that determines how much to damage the attribute
  // This can be simplified, but only computed when applied
  amount: {
    type: String,
    optional: true,
    defaultValue: '1d8 + strength.modifier',
  },
	// Who this damage applies to
	target: {
		type: String,
    defaultValue: 'every',
		allowedValues: [
      'self',   // the character who took the action
      'each',   // rolled once for `each` target
      'every',  // rolled once and applied to `every` target
    ],
	},
	damageType: {
		type: String,
		allowedValues: DAMAGE_TYPES,
		defaultValue: 'slashing',
	},
});

const ComputedOnlyDamageSchema = new SimpleSchema({
  amountResult: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  amountErrors: {
    type: Array,
    optional: true,
  },
  'amountErrors.$':{
    type: ErrorSchema,
  },
});

const ComputedDamageSchema = new SimpleSchema()
  .extend(DamageSchema)
  .extend(ComputedOnlyDamageSchema);

export { DamageSchema, ComputedDamageSchema, ComputedOnlyDamageSchema };
