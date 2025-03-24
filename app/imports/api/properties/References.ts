import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';

const ReferenceSchema = createPropertySchema({
  ref: {
    type: Object,
    defaultValue: {},
  },
  'ref.id': {
    type: String,
    optional: true,
  },
  'ref.collection': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.collectionName,
  },
  // Denormalised store of referenced property's details
  cache: {
    type: Object,
    defaultValue: {},
  },
  'cache.error': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.errorMessage,
  },
  'cache.node': {
    type: Object,
    optional: true,
  },
  'cache.node.name': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  'cache.node.type': {
    type: String,
    max: STORAGE_LIMITS.variableName,
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
  'cache.library.id': {
    type: String,
    optional: true,
  },
  'cache.library.name': {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
});

const ComputedOnlyReferenceSchema = createPropertySchema({});

export { ReferenceSchema, ComputedOnlyReferenceSchema };
