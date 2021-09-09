import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

// SlotFiller fillers specifically fill a slot with a bit more control than
// other properties
let SlotFillerSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  picture: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.url,
  },
  description: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.description,
  },
  // Overrides the type when searching for properties
  slotFillerType: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  // Fill more than one quantity in a slot, like feats and ability score
  // improvements, filtered out of UI if there isn't space in quantityExpected
  slotQuantityFilled: {
    type: SimpleSchema.Integer,
    defaultValue: 1,
  },
  // Filters out of UI if condition isn't met, but isn't otherwise enforced
  slotFillerCondition: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.calculation,
  },
});

export { SlotFillerSchema };
