import SimpleSchema from 'simpl-schema';

const ErrorSchema = new SimpleSchema({
  message: {
    type: String,
  },
	type: {
    type: String,
	},
});

export default ErrorSchema;
