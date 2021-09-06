import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';
import {
  fieldToCompute,
  computedOnlyField,
} from '/imports/api/properties/subSchemas/ComputedFieldSchema.js';
import { storedIconsSchema } from '/imports/api/icons/Icons.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

const ItemConsumedSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue(){
      if (!this.isSet) return Random.id();
    }
  },
  tag: {
    type: String,
    optional: true,
  },
  quantity: {
    type: Object,
    optional: true,
  },
  itemId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
}).extend(fieldToCompute('quantity'));

const ComputedOnlyItemConsumedSchema = new SimpleSchema({
  available: {
    type: Number,
    optional: true,
  },
  // This appears both in the computed and uncomputed schema because it can be
  // set by both a computation or a form
  itemId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  itemName: {
    type: String,
    max: STORAGE_LIMITS.name,
    optional: true,
  },
  itemIcon: {
    type: storedIconsSchema,
    optional: true,
    max: STORAGE_LIMITS.icon,
  },
  itemColor: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.color,
  },
}).extend(computedOnlyField('quantity'));

const ComputedItemConsumedSchema = new SimpleSchema()
  .extend(ItemConsumedSchema)
  .extend(ComputedOnlyItemConsumedSchema);

export {
  ItemConsumedSchema,
  ComputedOnlyItemConsumedSchema,
  ComputedItemConsumedSchema
};
