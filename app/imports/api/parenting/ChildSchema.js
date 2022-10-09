import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

const RefSchema = new SimpleSchema({
  id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    // TODO: Rather than indexing this field, index `ancestors.0.id` to only
    // index the root of the ancestor heirarchy to significantly reduce
    // index size and improve performance
    // All queries on an ancestor document need to target `ancestors.0.id` first
    // before targeting a younger ancestor
    index: 1
  },
  collection: {
    type: String,
    max: STORAGE_LIMITS.collectionName,
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
    maxCount: STORAGE_LIMITS.ancestorCount,
  },
  'ancestors.$': {
    type: RefSchema,
  },
});

export default ChildSchema;
export { RefSchema };
