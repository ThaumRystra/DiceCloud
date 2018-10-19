import SimpleSchema from 'simpl-schema';

const ColorSchema = new SimpleSchema({
  color:   {
		type: String,
		defaultValue: "#9E9E9E",
		// match hex colors of the form #A23 or #A23f56
		regEx: /^#([a-f0-9]{3}){1,2}\b$/i,
	},
});

export default ColorSchema;
