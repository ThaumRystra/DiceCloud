import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// These are the rolls made when saves are called for
// For the saving throw bonus or proficiency, see ./Skills.js
let SavingThrowSchema = new SimpleSchema ({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // The computed DC
  dc: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.calculation,
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

const ComputedOnlySavingThrowSchema = new SimpleSchema({
  dcResult: {
    type: Number,
    optional: true,
  },
  dcErrors: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.errorCount,
  },
  'dcErrors.$':{
    type: ErrorSchema,
  },
});

const ComputedSavingThrowSchema = new SimpleSchema()
  .extend(SavingThrowSchema)
  .extend(ComputedOnlySavingThrowSchema);

export { SavingThrowSchema, ComputedOnlySavingThrowSchema, ComputedSavingThrowSchema };
