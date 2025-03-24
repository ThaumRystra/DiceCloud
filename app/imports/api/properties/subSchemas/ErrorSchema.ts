import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const ErrorSchema = TypedSimpleSchema.from({
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
