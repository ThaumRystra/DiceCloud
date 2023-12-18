import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

const InlineComputationSchema = new SimpleSchema({
  // The part between bracers {}
  calculation: {
    type: String,
    max: STORAGE_LIMITS.calculation,
  },
  value: {
    type: SimpleSchema.oneOf(String, Number),
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
