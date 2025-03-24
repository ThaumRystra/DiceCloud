import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import ErrorSchema from '/imports/api/properties/subSchemas/ErrorSchema';
import {
  parse,
  prettifyParseError,
} from '/imports/parser/parser';
import STORAGE_LIMITS from '/imports/constants/STORAGE_LIMITS';
import createPropertySchema from '/imports/api/properties/subSchemas/createPropertySchema';
import Context from '/imports/parser/types/Context';
import { TypedSimpleSchema } from '/imports/api/utility/TypedSimpleSchema';

/*
 * Constants are primitive values that can be used elsewhere in computations
 */
const ConstantSchema = createPropertySchema({
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
      const calc = this.field('calculation');
      if (!calc.isSet && this.isModifier) {
        this.unset()
        return;
      }
      const string = calc.value;
      if (!string) return [];
      // Evaluate the calculation with no scope
      const { context } = parseString(string);
      return context && context.errors || [];
    }
  },
  'errors.$': {
    type: ErrorSchema,
  },
});

function parseString(string) {
  const context = new Context();
  if (!string) {
    return { result: string, context };
  }

  try {
    parse(string);
  } catch (e) {
    const message = prettifyParseError(e as Error);
    context.error(message);
    return { context, result: undefined };
  }

  return { context, result: undefined };
}

const ComputedOnlyConstantSchema = createPropertySchema({});

const ComputedConstantSchema = TypedSimpleSchema.from({})
  .extend(ConstantSchema)
  .extend(ComputedOnlyConstantSchema);

export { ConstantSchema, ComputedOnlyConstantSchema, ComputedConstantSchema };
