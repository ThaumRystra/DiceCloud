import { parse, CompilationContext } from '/imports/parser/parser.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';
import SymbolNode from '/imports/parser/parseTree/SymbolNode.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';

//TODO replace constants with their parsed node

export default function evaluateString({string, scope, fn = 'compile', context}){
  if (!context){
    context = new CompilationContext({});
  }
  if (!string){
    context.storeError('No string provided');
    return {result: {value: string}, context};
  }

  if (!scope) context.storeError('No scope provided');

  // Parse the string using mathjs
  let node;
  try {
    node = parse(string);
  } catch (e) {
    context.storeError(e);
    return {result: {value: string}, context};
  }
  node = replaceConstants({calc: node, context, scope});
  let result = node[fn](scope, context);
  return {result, context};
}

// Replace constants in the calc with the right ParseNodes
function replaceConstants({calc, context, scope}){
  let constFailed = [];
  calc = calc.replaceNodes(node => {
    if (!(node instanceof SymbolNode)) return;
    let constant = scope[node.name];
    // replace constants that aren't overridden by stats or disabled by a toggle
    if (constant && constant.type === 'constant'){
      // Fail if the constant has errors
      if (constant.errors && constant.errors.length){
        constFailed.push(node.name);
        return;
      }
      let parsedConstantNode;
      try {
        parsedConstantNode = parse(constant.calculation);
      } catch(e){
        constFailed.push(node.name);
        return;
      }
      if (!parsedConstantNode) constFailed.push(node.name);
      return parsedConstantNode;
    }
  });
  constFailed.forEach(name => {
    context.storeError({
      type: 'error',
      message: `${name} is a constant property with parsing errors`
    });
  });
  let failed = !!constFailed.length;
  if (failed){
    calc = new ErrorNode({error: 'Failed to replace constants'});
  }
  return calc;
}
