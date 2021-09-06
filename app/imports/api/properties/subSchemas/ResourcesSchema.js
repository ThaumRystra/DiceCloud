import SimpleSchema from 'simpl-schema';
import {
  ItemConsumedSchema,
  ComputedOnlyItemConsumedSchema,
  ComputedItemConsumedSchema
} from '/imports/api/properties/subSchemas/ItemConsumedSchema.js';
import {
  AttributeConsumedSchema,
  ComputedOnlyAttributeConsumedSchema,
  ComputedAttributeConsumedSchema
} from '/imports/api/properties/subSchemas/AttributeConsumedSchema.js';

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

const ResourcesComputedOnlySchema = new SimpleSchema({
  itemsConsumed: {
    type: Array,
    defaultValue: [],
  },
  'itemsConsumed.$': {
    type: ComputedOnlyItemConsumedSchema,
  },
  attributesConsumed: {
    type: Array,
    defaultValue: [],
  },
  'attributesConsumed.$': {
    type: ComputedOnlyAttributeConsumedSchema,
  },
});

const ResourcesComputedSchema = new SimpleSchema({
  itemsConsumed: {
    type: Array,
    defaultValue: [],
  },
  'itemsConsumed.$': {
    type: ComputedItemConsumedSchema,
  },
  attributesConsumed: {
    type: Array,
    defaultValue: [],
  },
  'attributesConsumed.$': {
    type: ComputedAttributeConsumedSchema,
  },
});

export {
  ResourcesSchema,
  ResourcesComputedOnlySchema,
  ResourcesComputedSchema,
};
