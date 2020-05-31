import SimpleSchema from 'simpl-schema';

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
    optional: true,
	},
	value: {
		type: Number,
		min: 0,
    optional: true,
	},
	description: {
		type: String,
		optional: true,
		trim: false
	},
});

const ComputedOnlyContainerSchema = new SimpleSchema({
  // Weight of all the contents, zero if `contentsWeightless` is true
  contentsWeight:{
    type: Number,
    optional: true,
  },
});

const ComputedContainerSchema = new SimpleSchema()
	.extend(ComputedOnlyContainerSchema)
	.extend(ContainerSchema);

export { ContainerSchema, ComputedContainerSchema };
