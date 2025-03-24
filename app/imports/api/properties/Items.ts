import SimpleSchema from 'simpl-schema';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const ItemSchema = createPropertySchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // Plural name of the item, if there is more than one
  plural: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  description: {
    type: 'inlineCalculationFieldToCompute' as const,
    optional: true,
  },
  // Number currently held
  quantity: {
    type: SimpleSchema.Integer,
    min: 0,
    defaultValue: 1
  },
  // Weight per item in the stack
  weight: {
    type: Number,
    min: 0,
    optional: true,
  },
  // Value per item in the stack, in gold pieces
  value: {
    type: Number,
    min: 0,
    optional: true,
  },
  // If this item is equipped, it requires attunement
  requiresAttunement: {
    type: Boolean,
    optional: true,
  },
  attuned: {
    type: Boolean,
    optional: true,
  },
  // Show increment/decrement buttons in item lists
  showIncrement: {
    type: Boolean,
    optional: true,
  },
  // Unequipped items shouldn't affect creature stats
  equipped: {
    type: Boolean,
    defaultValue: false,
  },
  // Prevent the property from showing up in the log
  silent: {
    type: Boolean,
    optional: true,
  },
  // Triggers that fire when this property is used as ammo
  'ammoTriggerIds': {
    type: Object,
    optional: true,
    removeBeforeCompute: true,
  },
  'ammoTriggerIds.before': {
    type: Array,
    optional: true,
  },
  'ammoTriggerIds.before.$': {
    type: String,
    max: 32,
  },
  'ammoTriggerIds.after': {
    type: Array,
    optional: true,
  },
  'ammoTriggerIds.after.$': {
    type: String,
    max: 32,
  },
  'ammoTriggerIds.afterChildren': {
    type: Array,
    optional: true,
  },
  'ammoTriggerIds.afterChildren.$': {
    type: String,
    max: 32,
  },
});

const ComputedOnlyItemSchema = createPropertySchema({
  description: {
    type: 'computedOnlyInlineCalculationField' as const,
    optional: true,
  },
});

const ComputedItemSchema = TypedSimpleSchema.from({})
  .extend(ItemSchema)
  .extend(ComputedOnlyItemSchema);

export { ItemSchema, ComputedItemSchema, ComputedOnlyItemSchema };
