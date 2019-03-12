import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

let Effects = new Mongo.Collection('effects');

/*
 * Effects are reason-value attached to skills and abilities
 * that modify their final value or presentation in some way
 */
let EffectSchema = schema({
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

const EffectComputedSchema = new SimpleSchema({
	// The computed result of the effect
	result: {
		type: SimpleSchema.oneOf(Number, String),
		optional: true,
	},
}).extend(EffectSchema);

Effects.attachSchema(PropertySchema);
Effects.attachSchema(ChildSchema);
Effects.attachSchema(EffectComputedSchema);

export default Effects;
export { EffectSchema };
