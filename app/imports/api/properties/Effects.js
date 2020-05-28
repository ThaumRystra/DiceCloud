import SimpleSchema from 'simpl-schema';

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
		optional: true,
	},
});

const ComputedOnlyEffectSchema = new SimpleSchema({
	// The computed result of the effect
	result: {
		type: SimpleSchema.oneOf(Number, String, Boolean),
		optional: true,
	},
})

const ComputedEffectSchema = new SimpleSchema()
	.extend(ComputedOnlyEffectSchema)
	.extend(EffectSchema);

export { EffectSchema, ComputedEffectSchema, ComputedOnlyEffectSchema };
