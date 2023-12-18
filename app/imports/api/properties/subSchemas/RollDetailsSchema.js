import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';

const RollDetailsSchema = new SimpleSchema({
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
