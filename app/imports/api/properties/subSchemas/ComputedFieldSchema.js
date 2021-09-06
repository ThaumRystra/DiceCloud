import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

const FieldToComputeSchema = new SimpleSchema({
  // This is required, if we don't have a calculation delete the whole object
  calculation: {
    type: String,
  },
});

const ComputedOnlyFieldSchema = new SimpleSchema({
  value: {
    type: SimpleSchema.oneOf(String, Number),
    optional: true,
  },
  errors: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.errorCount,
  },
  'errors.$':{
    type: ErrorSchema,
  },
});

const ComputedFieldSchema = new SimpleSchema()
  .extend(FieldToComputeSchema)
  .extend(ComputedOnlyFieldSchema)

export {
  FieldToComputeSchema,
  ComputedOnlyFieldSchema,
  ComputedFieldSchema
};
