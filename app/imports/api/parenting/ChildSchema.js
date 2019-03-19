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

let ChildSchema = schema({
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

const inheritedFields = new Set(RefSchema.objectKeys());
inheritedFields.delete('id');
inheritedFields.delete('collection');

export default ChildSchema;
export { inheritedFields };
