import SimpleSchema from 'simpl-schema';

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
  },
  'values.$': {
    type: Number,
  },
});

export default RollDetailsSchema;
