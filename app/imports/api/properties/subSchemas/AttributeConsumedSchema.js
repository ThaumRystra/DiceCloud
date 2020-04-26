import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';

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
  },
  quantity: {
    type: Number,
    defaultValue: 1,
  },
});

export default AttributeConsumedSchema;
