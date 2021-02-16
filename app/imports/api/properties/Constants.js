import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX.js';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema.js';
import {
  parse,
  CompilationContext,
  prettifyParseError,
} from '/imports/parser/parser.js';
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
      if (!string) return [];
      // Evaluate the calculation with no scope
      let {result, context} = parseString(string);
      // Any existing errors will result in an early failure
      if (context && context.errors.length) return context.errors;
      // Ban variables in constants if necessary
      result && result.traverse(node => {
        if (node instanceof SymbolNode || node instanceof AccessorNode){
          context.storeError()({
            type: 'error',
            message: 'Variables can\'t be used to define a constant'
          });
        }
      });
      return context && context.errors || [];
    }
  },
  'errors.$':{
    type: ErrorSchema,
  },
});

function parseString(string, fn = 'compile'){
  let context = new CompilationContext();
  if (!string){
    return {result: string, context};
  }

  // Parse the string using mathjs
  let node;
  try {
    node = parse(string);
  } catch (e) {
    let message = prettifyParseError(e);
    context.storeError({type: 'error', message});
    return {context};
  }
  let result = node[fn]({/*empty scope*/}, context);
  return {result, context}
}

export { ConstantSchema };
