import SimpleSchema from 'simpl-schema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

let SoftRemovableSchema = TypedSimpleSchema.from({
  'removed': {
    type: Boolean,
    optional: true,
    index: 1,
  },
  'removedAt': {
    type: Date,
    optional: true,
    index: 1,
  },
  'removedWith': {
    optional: true,
    type: String,
    max: 32,
    index: 1,
  },
});

export default SoftRemovableSchema;
