import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';

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
    defaultValue: 'every',
		allowedValues: [
      'self',   // the character who took the action
      'each',   // rolled once for `each` target
      'every',  // rolled once and applied to `every` target
    ],
	},
  // The variable name of save to roll
  stat: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
});

const ComputedOnlySavingThrowSchema = createPropertySchema({
  dc: {
    type: 'computedOnlyField',
    optional: true,
  },
});

const ComputedSavingThrowSchema = new SimpleSchema()
  .extend(SavingThrowSchema)
  .extend(ComputedOnlySavingThrowSchema);

export { SavingThrowSchema, ComputedOnlySavingThrowSchema, ComputedSavingThrowSchema };
