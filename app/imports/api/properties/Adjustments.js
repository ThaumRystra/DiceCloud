import SimpleSchema from 'simpl-schema';

const AdjustmentSchema = new SimpleSchema({
	// The roll that determines how much to change the attribute
  amount: {
    type: String,
    optional: true,
    defaultValue: '1',
  },
	// Who this adjustment applies to
	target: {
		type: String,
    defaultValue: 'every',
		allowedValues: [
      'self',   // the character who took the action
      'each',   // rolled once for `each` target
      'every',  // rolled once and applied to `every` target
    ],
	},
	// The stat this rolls applies to
	stat: {
		type: String,
    optional: true,
	},
});

export { AdjustmentSchema };
