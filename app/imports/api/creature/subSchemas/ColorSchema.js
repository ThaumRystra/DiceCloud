import SimpleSchema from 'simpl-schema';
import schema from '/imports/api/schema.js';

const ColorSchema = ({optional = false} = {}) => ({
	type: String,
	defaultValue: "#9E9E9E",
	// match hex colors of the form #A23 or #A23f56
	regEx: /^#([a-f0-9]{3}){1,2}\b$/i,
  optional
});

export default ColorSchema;
