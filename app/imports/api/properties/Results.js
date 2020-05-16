import SimpleSchema from 'simpl-schema';

const ResultSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  // Expression of whether or not to apply the children
  comparison: {
    type: String,
    optional: true,
  },
});

export { ResultSchema };
