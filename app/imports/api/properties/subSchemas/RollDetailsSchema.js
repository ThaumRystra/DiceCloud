import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const RollDetailsSchema = TypedSimpleSchema.from({
  number: {
    type: Number,
  },
  diceSize: {
    type: Number,
  },
  values: {
    type: Array,
    defaultValue: [],
    maxCount: STORAGE_LIMITS.diceRollValuesCount,
  },
  'values.$': {
    type: Number,
  },
});

export default RollDetailsSchema;
