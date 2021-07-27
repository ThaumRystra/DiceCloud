import SimpleSchema from 'simpl-schema';

let ReferenceSchema = new SimpleSchema({
  ref: {
    type: Object,
    defaultValue: {},
  },
  'ref.id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  'ref.collection': {
    type: String,
    optional: true,
  },
  // Denormalised store of referenced property's details
  cache: {
    type: Object,
    defaultValue: {},
  },
  'cache.error': {
    type: String,
    optional: true,
  },
  'cache.node': {
    type: Object,
    optional: true,
  },
  'cache.node.name': {
    type: String,
    optional: true,
  },
  'cache.node.type': {
    type: String,
  },
  'cache.node.level': {
    type: Number,
    optional: true,
  },
  'cache.node.value': {
    type: Number,
    optional: true,
  },
  'cache.library': {
    type: Object,
    optional: true,
  },
  'cache.library.name': {
    type: String,
    optional: true,
  },
});

export { ReferenceSchema };
