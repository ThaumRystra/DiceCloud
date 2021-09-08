import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';

const AdjustmentSchema = createPropertySchema({
	// The roll that determines how much to change the attribute
  // This can be simplified, but should only compute when activated
  amount: {
    type: 'fieldToCompute',
    parseLevel: 'compile',
    optional: true,
    defaultValue: 1,
  },
	// Who this adjustment applies to
	target: {
		type: String,
    defaultValue: 'every',
		allowedValues: [
      'self',   // the character who took the Adjustment
      'each',   // rolled once for `each` target
      'every',  // rolled once and applied to `every` target
    ],
	},
	// The stat this rolls applies to
	stat: {
		type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
	},
  operation: {
    type: String,
    allowedValues: ['set', 'increment'],
    defaultValue: 'increment',
  },
});

const ComputedOnlyAdjustmentSchema = createPropertySchema({
  amount: {
    type: 'computedOnlyField',
    parseLevel: 'compile',
    optional: true,
  },
});

const ComputedAdjustmentSchema = new SimpleSchema()
  .extend(AdjustmentSchema)
  .extend(ComputedOnlyAdjustmentSchema);

export { AdjustmentSchema, ComputedAdjustmentSchema, ComputedOnlyAdjustmentSchema };
