import SimpleSchema from 'simpl-schema';

let FeatureSchema = new SimpleSchema({
	name: {
		type: String,
	},
	enabled: {
    type: Boolean,
    defaultValue: true,
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
