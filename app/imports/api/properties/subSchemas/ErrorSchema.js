import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

const ErrorSchema = new SimpleSchema({
  message: {
    type: String,
    max: STORAGE_LIMITS.errorMessage,
  },
  type: {
    type: String,
    max: STORAGE_LIMITS.name,
  },
});

export default ErrorSchema;
