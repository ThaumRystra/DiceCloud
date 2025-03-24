import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const BuffSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: 'inlineCalculationFieldToCompute' as const,
    optional: true,
  },
  hideRemoveButton: {
    type: Boolean,
    optional: true,
  },
  // How many rounds this buff lasts
  duration: {
    type: 'fieldToCompute',
    optional: true,
  },
  target: {
    type: String,
    allowedValues: [
      'self',
      'target',
    ],
    defaultValue: 'target',
  },
  // Prevent the property from showing up in the log
  silent: {
    type: Boolean,
    optional: true,
  },
  // Prevent the children from being crystalized
  skipCrystalization: {
    type: Boolean,
    optional: true,
  },
});

const ComputedOnlyBuffSchema = createPropertySchema({
  description: {
    type: 'computedOnlyInlineCalculationField' as const,
    optional: true,
    max: STORAGE_LIMITS.description,
  },
  duration: {
    type: 'computedOnlyField' as const,
    optional: true,
  },
  durationSpent: {
    type: Number,
    optional: true,
    min: 0,
  },
  appliedBy: {
    type: Object,
    optional: true,
  },
  'appliedBy.name': {
    type: String,
    max: STORAGE_LIMITS.name,
  },
  'appliedBy.id': {
    type: String,
    max: 32,
  },
  'appliedBy.collection': {
    type: String,
    max: STORAGE_LIMITS.collectionName,
  },
});

const ComputedBuffSchema = TypedSimpleSchema.from({})
  .extend(BuffSchema)
  .extend(ComputedOnlyBuffSchema);

export { BuffSchema, ComputedOnlyBuffSchema, ComputedBuffSchema };
