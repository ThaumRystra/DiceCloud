import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const BranchSchema = createPropertySchema({
  branchType: {
    type: String,
    allowedValues: [
      // Uses the condition field to determine whether to apply children
      'if',
      // Attack
      'hit',
      'miss',
      // Save
      'failedSave',
      'successfulSave',
      // Iterate through targets
      'eachTarget',
      // Pick one child at random
      'random',
      // Pick one child based on a given index
      'index',
      // if it has option children, asks to select one
      // Otherwise presents its own text with yes/no
      'choice',
      //'option',
    ] as const,
    defaultValue: 'if',
  },
  text: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  condition: {
    type: 'fieldToCompute' as const,
    optional: true,
    parseLevel: 'compile',
  },
  // Prevent the property from showing up in the log
  silent: {
    type: Boolean,
    optional: true,
  },
});

const ComputedOnlyBranchSchema = createPropertySchema({
  condition: {
    type: 'computedOnlyField' as const,
    optional: true,
    parseLevel: 'compile',
  },
});

const ComputedBranchSchema = TypedSimpleSchema.from({})
  .extend(BranchSchema)
  .extend(ComputedOnlyBranchSchema);

export { BranchSchema, ComputedBranchSchema, ComputedOnlyBranchSchema }
