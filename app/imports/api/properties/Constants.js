import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import { parse, CompilationContext } from '/imports/parser/parser.js';
import AccessorNode from '/imports/parser/parseTree/AccessorNode.js';
import SymbolNode from '/imports/parser/parseTree/SymbolNode.js';
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
  errors: {
    type: Array,
    autoValue(){
      let calc = this.field('calculation');
      if (!calc.isSet && this.isModifier) {
        this.unset()
        return;
      }
      let string = calc.value;
      // Evaluate the calculation with no scope
      let {result, errors} = parseString(string);
      // Any errors will result in a failure
      if (errors.length) return errors;
      // Ban variables in constants if necessary
      result && result.traverse(node => {
        if (node instanceof SymbolNode || node instanceof AccessorNode){
          errors.push({
            type: 'error',
            message: 'Variables can\'t be used to define a constant'
          });
        }
      });
      return errors;
    }
  },
  'errors.$':{
    type: ErrorSchema,
  },
});

function parseString(string, fn = 'compile'){
  let errors = [];
  if (!string){
    return {result: string, errors};
  }

  // Parse the string using mathjs
  let node;
  try {
    node = parse(string);
  } catch (e) {
    let message = e.toString().split('.')[0];
    errors.push({type: 'error', message});
    return {result: string, errors};
  }
  // Parsing incomplete
  if (node === null){
    errors.push({type: 'warning', message: 'Unexpected end of input'});
    return {result: string, errors};
  }
  let context = new CompilationContext();
  let result = node[fn]({/*empty scope*/}, context);
  return {result, errors: context.errors}
}

export { ConstantSchema };
