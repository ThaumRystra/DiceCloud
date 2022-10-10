import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';

const AdjustmentSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue() {
      if (!this.isSet) return Random.id();
    }
  },
  // The roll that determines how much to change the attribute
  adjustment: {
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
});

export default AdjustmentSchema;
