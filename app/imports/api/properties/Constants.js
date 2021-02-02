import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';

/*
 * Constants are primitive values that can be used elsewhere in computations
 */
let ConstantSchema = new SimpleSchema({
  name: {
		type: String,
		optional: true,
	},
  // The technical, lowercase, single-word name used in formulae
  variableName: {
    type: String,
		regEx: VARIABLE_NAME_REGEX,
    min: 2,
    defaultValue: 'newConstant',
  },
	// The input value to be parsed, must return a constant node or an array
  // of constant nodes to be valid
	calculation: {
		type: String,
		optional: true,
	},
  // The value, or array of values
  result: {
    type: SimpleSchema.oneOf(String, Number, Boolean, Array),
    maxSize: 32,
  },
  'result.$': {
    type: SimpleSchema.oneOf(String, Number, Boolean),
  }
});

export { ConstantSchema };
