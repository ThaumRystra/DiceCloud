import SimpleSchema from 'simpl-schema';
import ItemConsumedSchema from '/imports/api/properties/subSchemas/ItemConsumedSchema.js';
import AttributeConsumedSchema from '/imports/api/properties/subSchemas/AttributeConsumedSchema.js';

const ResourcesSchema = new SimpleSchema({
  itemsConsumed: {
    type: Array,
    defaultValue: [],
  },
  'itemsConsumed.$': {
    type: ItemConsumedSchema,
  },
  attributesConsumed: {
    type: Array,
    defaultValue: [],
  },
  'attributesConsumed.$': {
    type: AttributeConsumedSchema,
  },
});

export default ResourcesSchema;
