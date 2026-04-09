import SimpleSchema from 'simpl-schema';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

let SoftRemovableSchema = TypedSimpleSchema.from({
  'removed': {
    type: Boolean,
    optional: true,
  },
  'removedAt': {
    type: Date,
    optional: true,
  },
  'removedWith': {
    optional: true,
    type: String,
    max: 32,
  },
});

export default SoftRemovableSchema;
