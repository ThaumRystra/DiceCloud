import SimpleSchema from 'simpl-schema';

let FeatureSchema = new SimpleSchema({
	name: {
		type: String,
	},
	summary: {
		type: String,
		optional: true,
	},
  description: {
		type: String,
		optional: true,
	},
});

export { FeatureSchema }
