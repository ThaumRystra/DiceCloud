import SimpleSchema from 'simpl-schema';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

const AdjustmentSchema = new SimpleSchema({
	// The roll that determines how much to change the attribute
  // This can be simplified, but should only compute when activated
  amount: {
    type: String,
    optional: true,
    defaultValue: '1',
    max: STORAGE_LIMITS.calculation,
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

const ComputedOnlyAdjustmentSchema = new SimpleSchema({
  amountResult: {
    type: SimpleSchema.oneOf(String, Number),
    optional: true,
  },
  amountErrors: {
    type: Array,
    optional: true,
    maxCount: STORAGE_LIMITS.errorCount,
  },
  'amountErrors.$':{
    type: ErrorSchema,
  },
});

const ComputedAdjustmentSchema = new SimpleSchema()
  .extend(AdjustmentSchema)
  .extend(ComputedOnlyAdjustmentSchema);

export { AdjustmentSchema, ComputedAdjustmentSchema, ComputedOnlyAdjustmentSchema };
