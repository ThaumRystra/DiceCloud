import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';

const InlineComputationSchema = new SimpleSchema({
	// The part between bracers {}
  calculation: {
    type: String,
  },
  result: {
    type: String,
    optional: true,
  },
  errors: ErrorSchema,
});

export default InlineComputationSchema;
