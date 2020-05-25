import SimpleSchema from 'simpl-schema';

const RefSchema = new SimpleSchema({
  id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  collection: {
    type: String
  },
});

let ChildSchema = new SimpleSchema({
  order: {
    type: Number,
  },
	parent: {
    type: RefSchema,
    optional: true,
  },
  ancestors: {
    type: Array,
    defaultValue: [],
    max: 100,
  },
  'ancestors.$': {
    type: RefSchema,
  },
});

export default ChildSchema;
export { RefSchema };
