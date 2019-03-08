import schema from '/imports/api/schema.js';

const refSchema = new SimpleSchema({
  id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  collection: {
    type: String
  },
  name: {
    type: String,
    optional: true,
  },
  enabled: {
    type: Boolean,
    optional: true,
    index: 1,
  },
});

let childSchema = schema({
	parent: {
    type: refSchema,
    optional: true,
  },
  ancestors: {
    type: Array,
    defaultValue: [],
  },
  'ancestors.$': {
    type: refSchema,
  },
});

export default childSchema;
