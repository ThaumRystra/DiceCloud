import SimpleSchema from 'simpl-schema';

const ResourceSchema = new SimpleSchema({
  itemsConsumed: {
    type: Array,
    defaultValue: [],
  },
  'itemsConsumed.$': {
    type: Object,
  },
  'itemsConsumed.$.variableName': {
    type: String,
  },
  'itemsConsumed.$.quantity': {
    type: Number,
    defaultValue: 1,
  },
  attributesConsumed: {
    type: Array,
    defaultValue: [],
  },
  'attributesConsumed.$': {
    type: Object,
  },
  'attributesConsumed.$.variableName': {
    type: String,
  },
  'attributesConsumed.$.quantity': {
    type: Number,
    defaultValue: 1,
  },
});

export default ResourceSchema;
