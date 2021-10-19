import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';
import { SlotSchema, ComputedOnlySlotSchema } from './Slots.js';

// Classes are like slots, except they only take class levels and enforce that
// lower levels are taken before higher levels
let ClassSchema = createPropertySchema({
  // Only `classLevel`s with the same variable name can fill the class
  variableName: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
}).extend(SlotSchema);

const ComputedOnlyClassSchema = createPropertySchema({
    level: {
      type: SimpleSchema.Integer,
      optional: true,
      removeBeforeCompute: true,
    },
    missingLevels: {
      type: Array,
      optional: true,
      removeBeforeCompute: true,
    },
    'missingLevels.$': {
      type: SimpleSchema.Integer,
    },
  }).extend(ComputedOnlySlotSchema);

const ComputedClassSchema = new SimpleSchema()
  .extend(ClassSchema)
  .extend(ComputedOnlyClassSchema);

export { ClassSchema, ComputedOnlyClassSchema, ComputedClassSchema };
