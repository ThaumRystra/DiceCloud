import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';

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

let ChildSchema = schema({
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
