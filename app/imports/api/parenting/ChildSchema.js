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
    min: 0,
  },
	parent: {
    type: RefSchema,
    optional: true,
  },
  ancestors: {
    type: Array,
    defaultValue: [],
  },
  'ancestors.$': {
    type: RefSchema,
  },
});

export default ChildSchema;
