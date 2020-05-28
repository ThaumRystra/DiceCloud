import SimpleSchema from 'simpl-schema';

const ErrorSchema = new SimpleSchema({
	// The roll that determines how much to change the attribute
  message: {
    type: String,
  },
	// Who this adjustment applies to
	type: {
    type: String,
	},
});

export default ErrorSchema;
