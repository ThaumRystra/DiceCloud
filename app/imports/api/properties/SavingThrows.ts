import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

// These are the rolls made when saves are called for
// For the saving throw bonus or proficiency, see ./Skills.js
const SavingThrowSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // The computed DC
  dc: {
    type: 'fieldToCompute' as const,
    optional: true,
  },
  // Who this saving throw applies to
  target: {
    type: String,
    defaultValue: 'target',
    allowedValues: [
      'self',
      'target',
    ] as const,
  },
  // The variable name of save to roll
  stat: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  // Prevent the property from showing up in the log
  silent: {
    type: Boolean,
    optional: true,
  },
});

const ComputedOnlySavingThrowSchema = createPropertySchema({
  dc: {
    type: 'computedOnlyField' as const,
    parseLevel: 'compile',
    optional: true,
  },
});

const ComputedSavingThrowSchema = TypedSimpleSchema.from({})
  .extend(SavingThrowSchema)
  .extend(ComputedOnlySavingThrowSchema);

export { SavingThrowSchema, ComputedOnlySavingThrowSchema, ComputedSavingThrowSchema };
