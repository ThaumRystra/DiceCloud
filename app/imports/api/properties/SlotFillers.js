// SlotFiller fillers specifically fill a slot with a bit more control than
// other properties

import SimpleSchema from 'simpl-schema';

let SlotFillerSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  picture: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  // Overrides the type when searching for properties
  slotFillerType: {
    type: String,
    optional: true,
  },
  // Fill more than one quantity in a slot, like feats and ability score
  // improvements, filtered out of UI if there isn't space in quantityExpected
  slotQuantityFilled: {
    type: SimpleSchema.Integer,
    defaultValue: 1,
    min: 0,
  },
  // Filters out of UI if condition isn't met, but isn't otherwise enforced
  slotFillerCondition: {
    type: String,
    optional: true,
  },
});

export { SlotFillerSchema };
