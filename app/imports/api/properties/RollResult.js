import SimpleSchema from 'simpl-schema';
import AdjustmentSchema from '/imports/api/creature/subSchemas/AdjustmentSchema.js';
import { StoredBuffWithIdSchema } from '/imports/api/properties/Buffs.js';

let RollResultSchema = new SimpleSchema ({
  // Expression of whether or not to apply buffs
  comparison: {
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
  buffs: {
		type: Array,
		defaultValue: [],
	},
	'buffs.$': {
		type: StoredBuffWithIdSchema,
	},
});

export { RollResultSchema };
