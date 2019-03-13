import SimpleSchema from 'simpl-schema';
import SoftRemovableSchema from '/imports/api/parenting/SoftRemovableSchema.js';

const PropertySchema = new SimpleSchema({
  charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
    optional: true,
	},
  enabled: {
    type: Boolean,
    defaultValue: true,
  },
  name: {
		type: String,
		optional: true,
	},
  order: {
  	type: SimpleSchema.Integer,
  	index: true,
  },
});

PropertySchema.extend(SoftRemovableSchema);

export default PropertySchema;
