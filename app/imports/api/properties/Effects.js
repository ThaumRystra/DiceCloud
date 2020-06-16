import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
/*
 * Effects are reason-value attached to skills and abilities
 * that modify their final value or presentation in some way
 */
let EffectSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
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
	},
	//which stats the effect is applied to
	stats: {
		type: Array,
		defaultValue: [],
	},
	'stats.$': {
		type: String,
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
  },
  'errors.$':{
    type: ErrorSchema,
  },
});

const ComputedEffectSchema = new SimpleSchema()
	.extend(ComputedOnlyEffectSchema)
	.extend(EffectSchema);

export { EffectSchema, ComputedEffectSchema, ComputedOnlyEffectSchema };
