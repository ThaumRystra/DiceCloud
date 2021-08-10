import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

const InlineComputationSchema = new SimpleSchema({
	// The part between bracers {}
  calculation: {
    type: String,
    max: STORAGE_LIMITS.calculation,
  },
  result: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.calculation,
  },
  errors: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.errorCount,
  },
  'errors.$': ErrorSchema,
});

export default InlineComputationSchema;
