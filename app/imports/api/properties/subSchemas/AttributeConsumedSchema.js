import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS.js';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema.js';

const AttributeConsumedSchema = createPropertySchema({
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
    type: 'fieldToCompute',
    optional: true,
  },
});

const ComputedOnlyAttributeConsumedSchema = createPropertySchema({
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
  quantity: {
    type: 'computedOnlyField',
    optional: true,
  },
});

const ComputedAttributeConsumedSchema = new SimpleSchema()
  .extend(AttributeConsumedSchema)
  .extend(ComputedOnlyAttributeConsumedSchema);

export {
  AttributeConsumedSchema,
  ComputedOnlyAttributeConsumedSchema,
  ComputedAttributeConsumedSchema
};
