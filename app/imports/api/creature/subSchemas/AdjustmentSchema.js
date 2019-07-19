import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';

const AdjustmentSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue(){
      if (this.isSet) return;
      return Random.id();
    }
  },
	// The roll that determines how much to damage the attribute
  damage: {
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
