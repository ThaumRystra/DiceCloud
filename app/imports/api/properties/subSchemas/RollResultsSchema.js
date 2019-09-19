import SimpleSchema from 'simpl-schema';
import AdjustmentSchema from '/imports/api/properties/subSchemas/AdjustmentSchema.js';
import DamageSchema from '/imports/api/properties/subSchemas/AdjustmentSchema.js';
import { StoredBuffWithIdSchema } from '/imports/api/properties/Buffs.js';

let RollResultsSchema = new SimpleSchema ({
  // Expression of whether or not to apply the roll
  // Evaluates to an expression which gets compared to the roll
  // or a number which the roll must equal
  comparison: {
    type: String,
    optional: true,
  },
  damages: {
		type: Array,
		defaultValue: [],
	},
	'damages.$': {
		type: DamageSchema,
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

export { RollResultsSchema };
