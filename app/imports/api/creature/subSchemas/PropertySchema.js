import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';

const PropertySchema = schema({
  charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
	},
  enabled: {
    type: Boolean,
    defaultValue: true,
  },
});

export default PropertySchema;
