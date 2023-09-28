import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';

let ContainerSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    trim: false,
    max: STORAGE_LIMITS.name,
  },
  carried: {
    type: Boolean,
    defaultValue: true,
    optional: true,
  },
  contentsWeightless: {
    type: Boolean,
    optional: true,
  },
  weight: {
    type: Number,
    min: 0,
    optional: true,
  },
  value: {
    type: Number,
    min: 0,
    optional: true,
  },
  description: {
    type: 'inlineCalculationFieldToCompute',
    optional: true,
  },
});

const ComputedOnlyContainerSchema = createPropertySchema({
  description: {
    type: 'computedOnlyInlineCalculationField',
    optional: true,
  },
  // Weight of all the contents, zero if `contentsWeightless` is true
  contentsWeight: {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
  // Weight of all the carried contents (some sub-containers might not be carried)
  // zero if `contentsWeightless` is true
  carriedWeight: {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
  contentsValue: {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
  carriedValue: {
    type: Number,
    optional: true,
    removeBeforeCompute: true,
  },
});

const ComputedContainerSchema = new SimpleSchema()
  .extend(ComputedOnlyContainerSchema)
  .extend(ContainerSchema);

export { ContainerSchema, ComputedOnlyContainerSchema, ComputedContainerSchema };
