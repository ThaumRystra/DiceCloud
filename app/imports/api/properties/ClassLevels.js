import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

let ClassLevelSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
	},
	// The name of this class level's variable
	variableName: {
    type: String,
		regEx: VARIABLE_NAME_REGEX,
  },
	// The variable name of the base class this level is attached to
	baseClass: {
		type: String,
		regEx: VARIABLE_NAME_REGEX,
		optional: true,
	},
	level: {
    type: SimpleSchema.Integer,
		defaultValue: 1,
  },
});

export { ClassLevelSchema };
