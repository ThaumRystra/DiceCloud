import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';
import {
  fieldToCompute,
  computedOnlyField,
} from '/imports/api/properties/subSchemas/ComputedFieldSchema.js';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';

const AttributeConsumedSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue(){
      if (!this.isSet) return Random.id();
    }
  },
  variableName: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.variableName,
  },
  quantity: {
    type: Object,
    optional: true,
  },
}).extend(fieldToCompute('quantity'));

const ComputedOnlyAttributeConsumedSchema = new SimpleSchema({
  available: {
    type: Number,
    optional: true,
  },
  statId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  statName: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
}).extend(computedOnlyField('quantity'));

const ComputedAttributeConsumedSchema = new SimpleSchema()
  .extend(AttributeConsumedSchema)
  .extend(ComputedOnlyAttributeConsumedSchema);

export {
  AttributeConsumedSchema,
  ComputedOnlyAttributeConsumedSchema,
  ComputedAttributeConsumedSchema
};
