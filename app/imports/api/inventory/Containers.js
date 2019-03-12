import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';
import ColorSchema from "/imports/api/creature/subSchemas/ColorSchema.js";
import PropertySchema from '/imports/api/creature/subSchemas/PropertySchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

//set up the collection for containers
let Containers = new Mongo.Collection("containers");

let ContainerSchema = schema({
	name: {
		type: String,
		optional: true,
		trim: false
	},
	isCarried: {
		type: Boolean,
		defaultValue: true,
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

ContainerSchema.extend(ColorSchema);

Containers.attachSchema(ContainerSchema);
Containers.attachSchema(PropertySchema);
Containers.attachSchema(ChildSchema);

export default Containers;
export { ContainerSchema };
