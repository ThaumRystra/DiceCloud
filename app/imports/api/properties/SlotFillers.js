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
});

const ComputedOnlySlotFillerSchema = new SimpleSchema({});

export { SlotFillerSchema, ComputedOnlySlotFillerSchema };
