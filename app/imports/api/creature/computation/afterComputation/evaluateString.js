import { parse, CompilationContext } from '/imports/parser/parser.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

export default function evaluateString(string, scope, fn = 'compile'){
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
  // Parsing failed
  if (node === null){
    errors.push('...');
    return {result: string, errors};
  }
  console.log(node);
  let context = new CompilationContext();
  let result = node[fn](scope, context);
  if (result instanceof ConstantNode){
    return {result: result.value, errors: context.errors}
  } else {
    return {result: result.toString(), errors: context.errors};
  }
}
