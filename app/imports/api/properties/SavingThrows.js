import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';

// These are the rolls made when saves are called for
// For the saving throw bonus or proficiency, see ./Skills.js
let SavingThrowSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // The computed DC
  dc: {
    type: 'fieldToCompute',
    optional: true,
  },
  // Who this saving throw applies to
  target: {
    type: String,
    defaultValue: 'target',
    allowedValues: [
      'self',
      'target',
    ],
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
    type: 'computedOnlyField',
    parseLevel: 'compile',
    optional: true,
  },
});

const ComputedSavingThrowSchema = new SimpleSchema({})
  .extend(SavingThrowSchema)
  .extend(ComputedOnlySavingThrowSchema);

export { SavingThrowSchema, ComputedOnlySavingThrowSchema, ComputedSavingThrowSchema };
