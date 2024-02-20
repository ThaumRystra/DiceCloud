import SimpleSchema from 'simpl-schema';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema';
import {
  parse,
  prettifyParseError,
} from '/imports/parser/parser';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import resolve from '/imports/parser/resolve';
import Context from '../../parser/types/Context';
import traverse from '/imports/parser/traverse';

/*
 * Constants are primitive values that can be used elsewhere in computations
 */
let ConstantSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.name,
  },
  // The technical, lowercase, single-word name used in formulae
  variableName: {
    type: String,
    regEx: VARIABLE_NAME_REGEX,
    min: 2,
    defaultValue: 'newConstant',
    max: STORAGE_LIMITS.variableName,
  },
  // The input value to be parsed, must return a constant node or an array
  // of constant nodes to be valid
  calculation: {
    type: String,
    optional: true,
    max: STORAGE_LIMITS.calculation,
  },
  errors: {
    type: Array,
    maxCount: STORAGE_LIMITS.errorCount,
    autoValue() {
      let calc = this.field('calculation');
      if (!calc.isSet && this.isModifier) {
        this.unset()
        return;
      }
      let string = calc.value;
      if (!string) return [];
      // Evaluate the calculation with no scope
      let { result, context } = parseString(string);
      // Any existing errors will result in an early failure
      if (context && context.errors.length) return context.errors;
      // Ban variables in constants if necessary
      result && traverse(result, node => {
        if (node.parseType === 'symbol' || node.parseType === 'accessor') {
          context.error('Variables can\'t be used to define a constant');
        }
      });
      return context && context.errors || [];
    }
  },
  'errors.$': {
    type: ErrorSchema,
  },
});

function parseString(string, fn = 'compile') {
  let context = new Context();
  if (!string) {
    return { result: string, context };
  }

  // Parse the string using mathjs
  let node;
  try {
    node = parse(string);
  } catch (e) {
    let message = prettifyParseError(e);
    context.error(message);
    return { context };
  }
  if (!node) return { context };
  let { result } = resolve(fn, node, {/*empty scope*/ }, context);
  return { result, context }
}

const ComputedOnlyConstantSchema = new SimpleSchema({});

export { ConstantSchema, ComputedOnlyConstantSchema };
