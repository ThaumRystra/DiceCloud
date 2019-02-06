import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import {makeChild} from "/imports/api/parenting.js";

Effects = new Mongo.Collection("effects");

/*
 * Effects are reason-value attached to skills and abilities
 * that modify their final value or presentation in some way
 */
effectSchema = schema({
	charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
	},
	name: {
		type: String,
		optional: true, //TODO make necessary if there is no owner
		trim: false,
	},
	operation: {
		type: String,
		defaultValue: "add",
		allowedValues: [
			"base",
			"add",
			"mul",
			"min",
			"max",
			"advantage",
			"disadvantage",
			"passiveAdd",
			"fail",
			"conditional",
		],
	},
	calculation: {
		type: String,
		optional: true,
		trim: false,
	},
	// The computed result of the effect
	result: {
		type: SimpleSchema.oneOf(Number, String),
		optional: true,
	},
	//which stat the effect is applied to
	stat: {
		type: String,
		optional: true,
	},
	enabled: {
		type: Boolean,
		defaultValue: true,
	},
});

Effects.attachSchema(effectSchema);

//Effects.attachBehaviour("softRemovable");
makeChild(Effects, ["enabled"]); //children of lots of things

export default Effects;
