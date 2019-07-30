import SimpleSchema from 'simpl-schema';

/*
 * Effects are reason-value attached to skills and abilities
 * that modify their final value or presentation in some way
 */
let EffectSchema = new SimpleSchema({
	_id: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		autoValue(){
			if (!this.isSet) return Random.id();
		}
	},
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
			'advantage',
			'disadvantage',
			'passiveAdd',
			'fail',
			'conditional',
		],
	},
	calculation: {
		type: String,
		optional: true,
	},
	//which stat the effect is applied to
	stat: {
		type: String,
		optional: true,
	},
});

const ComputedEffectSchema = new SimpleSchema({
	// The computed result of the effect
	result: {
		type: SimpleSchema.oneOf(Number, String),
		optional: true,
	},
}).extend(EffectSchema);

export { EffectSchema, ComputedEffectSchema };
