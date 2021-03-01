import { parse, CompilationContext } from '/imports/parser/parser.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

//TODO replace constants with their parsed node

export default function evaluateString(string, scope, fn = 'compile', context){
  let errors = [];
  if (!string){
    errors.push('No string provided');
    return {result: string, errors};
  }

  if (!scope) errors.push('No scope provided');

  // Parse the string using mathjs
  let node;
  try {
    node = parse(string);
  } catch (e) {
    errors.push(e);
    return {result: string, errors};
  }
  if (!context){
    context = new CompilationContext({});
  }
  let result = node[fn](scope, context);
  if (result instanceof ConstantNode){
    return {result: result.value, errors: context.errors}
  } else {
    return {result: result.toString(), errors: context.errors};
  }
}
