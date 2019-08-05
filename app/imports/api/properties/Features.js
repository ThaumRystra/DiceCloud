import SimpleSchema from 'simpl-schema';

let FeatureSchema = new SimpleSchema({
	name: {
		type: String,
	},
	description: {
		type: String,
		optional: true,
	},
	alwaysEnabled: {
		type: Boolean,
		defaultValue: true
	},
});

export { FeatureSchema }
