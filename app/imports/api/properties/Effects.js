import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';

/*
 * Effects are reason-value attached to skills and abilities
 * that modify their final value or presentation in some way
 */
let EffectSchema = createPropertySchema({
	name: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.name,
	},
	operation: {
		type: String,
		defaultValue: 'add',
		allowedValues: [
			'base',
			'add',
			'mul',
			'min',
			'max',
      'set',
			'advantage',
			'disadvantage',
			'passiveAdd',
			'fail',
			'conditional',
			'rollBonus',
		],
	},
	amount: {
		type: 'fieldToCompute',
		optional: true,
	},
	//which stats the effect is applied to
	stats: {
		type: Array,
		defaultValue: [],
    maxCount: STORAGE_LIMITS.statsToTarget,
	},
	'stats.$': {
		type: String,
    max: STORAGE_LIMITS.variableName,
	},
});

const ComputedOnlyEffectSchema = createPropertySchema({
  amount: {
    type: 'computedOnlyField',
    optional: true,
  },
});

const ComputedEffectSchema = new SimpleSchema()
	.extend(ComputedOnlyEffectSchema)
	.extend(EffectSchema);

export { EffectSchema, ComputedEffectSchema, ComputedOnlyEffectSchema };
