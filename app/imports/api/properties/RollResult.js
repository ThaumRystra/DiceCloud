import SimpleSchema from 'simpl-schema';
import AdjustmentSchema from '/imports/api/creature/subSchemas/AdjustmentSchema.js';
import { StoredBuffWithIdSchema } from '/imports/api/properties/Buffs.js';

let RollResultSchema = new SimpleSchema ({
  comparison: {
    type: String,
    allowedValues: ['>', '<', '>=', '<=', '==', 'always', 'else'],
  },
  targetValue: {
    type: String,
    optional: true,
  },
  adjustments: {
		type: Array,
		defaultValue: [],
	},
	'adjustments.$': {
		type: AdjustmentSchema,
	},
  // The buffs to be applied
  buffs: {
		type: Array,
		defaultValue: [],
	},
	'buffs.$': {
		type: StoredBuffWithIdSchema,
	},
});

export { RollResultSchema };
