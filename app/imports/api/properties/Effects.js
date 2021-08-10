import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

/*
 * Effects are reason-value attached to skills and abilities
 * that modify their final value or presentation in some way
 */
let EffectSchema = new SimpleSchema({
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
	calculation: {
		type: String,
		optional: true,
    max: STORAGE_LIMITS.calculation,
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

const ComputedOnlyEffectSchema = new SimpleSchema({
	// The computed result of the effect
	result: {
		type: SimpleSchema.oneOf(Number, String, Boolean),
		optional: true,
	},
  // The errors encountered while computing the result
  errors: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.errorCount,
  },
  'errors.$':{
    type: ErrorSchema,
  },
});

const ComputedEffectSchema = new SimpleSchema()
	.extend(ComputedOnlyEffectSchema)
	.extend(EffectSchema);

export { EffectSchema, ComputedEffectSchema, ComputedOnlyEffectSchema };
