import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';

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
    type: Number,
    defaultValue: 1,
  },
  itemId: {
    type: String,
    optional: true,
  },
});

export default ItemConsumedSchema;
