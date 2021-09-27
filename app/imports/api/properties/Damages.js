import SimpleSchema from 'simpl-schema';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

const DamageSchema = createPropertySchema({
	// The roll that determines how much to damage the attribute
  // This can be simplified, but only computed when applied
  amount: {
    type: 'fieldToCompute',
    optional: true,
    defaultValue: '1d8 + strength.modifier',
    parseLevel: 'compile',
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
    max: STORAGE_LIMITS.calculation,
		defaultValue: 'slashing',
	},
});

const ComputedOnlyDamageSchema = createPropertySchema({
  amount: {
    type: 'computedOnlyField',
    optional: true,
    parseLevel: 'compile',
  },
});

const ComputedDamageSchema = new SimpleSchema()
  .extend(DamageSchema)
  .extend(ComputedOnlyDamageSchema);

export { DamageSchema, ComputedDamageSchema, ComputedOnlyDamageSchema };
