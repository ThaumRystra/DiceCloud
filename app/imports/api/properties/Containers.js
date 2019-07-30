import SimpleSchema from 'simpl-schema';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import { PropertySchema } from '/imports/api/properties/Properties.js'
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

let ContainerSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
		trim: false
	},
	carried: {
		type: Boolean,
		defaultValue: true,
		optional: true,
	},
	contentsWeightless: {
		type: Boolean,
		optional: true,
	},
	weight: {
		type: Number,
		min: 0,
		defaultValue: 0
	},
	value: {
		type: Number,
		min: 0,
		defaultValue: 0
	},
	description: {
		type: String,
		optional: true,
		trim: false
	},
});

export { ContainerSchema };
