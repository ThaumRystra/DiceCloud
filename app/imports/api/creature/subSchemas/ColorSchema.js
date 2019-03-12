import SimpleSchema from 'simpl-schema';

const getColorSchema = function({optional = true} = {}){
	let schema = {
		type: String,
		// match hex colors of the form #A23 or #A23f56
		regEx: /^#([a-f0-9]{3}){1,2}\b$/i,
	};
	if (optional) {
		schema.optional = true;
	} else {
		schema.defaultValue = "#9E9E9E";
	}
	return schema
};

const ColorSchema = new SimpleSchema({
	color: getColorSchema(),
});

export default ColorSchema;
export { getColorSchema };
