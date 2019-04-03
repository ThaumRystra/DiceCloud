import SimpleSchema from 'simpl-schema';
import SoftRemovableSchema from '/imports/api/parenting/SoftRemovableSchema.js';
import ChildSchema from '/imports/api/parenting/ChildSchema.js';

const PropertySchema = new SimpleSchema({
  charId: {
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		index: 1,
    optional: true,
	},
  name: {
    type: String,
    optional: true,
  },
  enabled: {
    type: Boolean,
    defaultValue: true,
  },
  order: {
  	type: SimpleSchema.Integer,
  	index: true,
  },
});

PropertySchema.extend(SoftRemovableSchema);
PropertySchema.extend(ChildSchema);

export default PropertySchema;
