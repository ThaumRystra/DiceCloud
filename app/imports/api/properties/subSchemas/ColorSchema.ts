import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

const ColorSchema = TypedSimpleSchema.from({
  color: {
    type: String,
    // match hex colors of the form #A23 or #A23f56
    regEx: /^#([a-f0-9]{3}){1,2}\b$/i,
    optional: true,
  },
});

export default ColorSchema;
