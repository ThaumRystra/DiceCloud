import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';
import DAMAGE_TYPES from '/imports/constants/DAMAGE_TYPES.js';

const DamageSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue(){
      if (!this.isSet) return Random.id();
    }
  },
	// The roll that determines how much to damage the attribute
  damage: {
    type: String,
    optional: true,
    defaultValue: '1d8 + strength.modifier',
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
	damageType: {
		type: String,
		allowedValues: DAMAGE_TYPES,
		defaultValue: 'slashing',
	},
});

export default DamageSchema;
