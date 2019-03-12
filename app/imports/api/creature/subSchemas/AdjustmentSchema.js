import SimpleSchema from 'simpl-schema';
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';

const AdjustmentSchema = new SimpleSchema({
	// The calculation that determines the adjustment
  roll: {
    type: String,
    optional: true,
  },
	// Who this adjustment applies to
	target: {
		type: String,
		allowedValues: [
      // the character who took the action
      'self',
      // the singular `target` of the action
      'target',
      // rolled once for `each` target
      'each',
      // rolled once and applied to `every` target
      'every'
    ],
	},
	// The stat this rolls applies to, if damage type is set, this is ignored
	stat: {
		type: String,
    optional: true,
	},
	// If set, the type of damage this adjustment causes
	damageType: {
		type: String,
		allowedValues: DAMAGE_TYPES,
		optional: true,
	},
});

export default AdjustmentSchema;
