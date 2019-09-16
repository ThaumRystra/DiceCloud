import SimpleSchema from 'simpl-schema';
import AdjustmentSchema from '/imports/api/properties/subSchemas/AdjustmentSchema.js';
import { StoredBuffWithIdSchema } from '/imports/api/properties/Buffs.js';

// These are the rolls made when saves are called for
// For the saving throw bonus or proficiency, see ./Skills.js
let SavingThrowSchema = new SimpleSchema ({
  dc: {
    type: String,
    optional: true,
  },
  // The variable name of ability the saving throw relies on
  ability: {
    type: String,
    optional: true,
  },
  passAdjustments: {
		type: Array,
		defaultValue: [],
	},
	'passAdjustments.$': {
		type: AdjustmentSchema,
	},
  passBuffs: {
		type: Array,
		defaultValue: [],
	},
	'passBuffs.$': {
		type: StoredBuffWithIdSchema,
	},
  failAdjustments: {
		type: Array,
		defaultValue: [],
	},
	'failAdjustments.$': {
		type: AdjustmentSchema,
	},
  failBuffs: {
		type: Array,
		defaultValue: [],
	},
	'failBuffs.$': {
		type: StoredBuffWithIdSchema,
	},
});

export { SavingThrowSchema };
