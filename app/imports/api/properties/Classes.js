import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

// TODO use variable name in computation engine, rather than a generated one
let ClassSchema = new SimpleSchema({
  name: {
		type: String,
		optional: true,
	},
  variableName: {
    type: String,
		regEx: VARIABLE_NAME_REGEX,
  },
});

export { ClassSchema };
