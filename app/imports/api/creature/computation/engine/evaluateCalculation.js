import computeStat from '/imports/api/creature/computation/engine/computeStat.js';
import { prettifyParseError, parse, CompilationContext } from '/imports/parser/parser.js';
import SymbolNode from '/imports/parser/parseTree/SymbolNode.js';
import AccessorNode from '/imports/parser/parseTree/AccessorNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';
import ErrorNode from '/imports/parser/parseTree/ErrorNode.js';
import findAncestorByType from '/imports/api/creature/computation/engine/findAncestorByType.js';
import { union } from 'lodash';

/* Convert a calculation into a constant output and errors*/
export default function evaluateCalculation({
  string,
  prop,
  memo,
  fn = 'reduce',
}){
  let dependencies = [];
  let context = new CompilationContext();
  if (!string) return {
    result: new ConstantNode({value: string, type: 'string'}),
    context,
    dependencies,
  };
  // Parse the string
  let calc;
  try {
    calc = parse(string);
  } catch (e) {
    let error = prettifyParseError(e);
    return {
      result: new ErrorNode({context, error}),
      context,
      dependencies,
    };
  }

  // Replace constants with their parsed constant
  let replaceResults = replaceConstants({
    calc, memo, prop, dependencies, context
  });
  dependencies = replaceResults.dependencies;
  calc = replaceResults.calc;
  if (replaceResults.failed){
    return {
      result: new ConstantNode({value: string, type: 'string'}),
      context,
      dependencies,
    };
  }

  // Ensure all symbol nodes are defined and computed
  dependencies = computeSymbols({calc, memo, prop, dependencies})

  // Evaluate
  let result = calc[fn](memo.statsByVariableName, context);
  return {result, context, dependencies};
}

// Replace constants in the calc with the right ParseNodes
function replaceConstants({calc, memo, prop, dependencies, context}){
  let constFailed = [];
  calc = calc.replaceNodes(node => {
    if (!(node instanceof SymbolNode)) return;
    let stat, constant;
    if (node.name[0] !== '#'){
      stat = memo.statsByVariableName[node.name]
      constant = memo.constantsByVariableName[node.name];
    } else if (node.name === '#constant'){
      constant = findAncestorByType({type: 'constant', prop, memo});
    }
    // replace constants that aren't overridden by stats
    if (constant && !stat){
      dependencies = union(dependencies, [
        constant._id,
        ...constant.dependencies
      ]);
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
  return { failed, dependencies, calc };
}

  // Ensure all symbol nodes are defined and computed
function computeSymbols({calc, memo, prop, dependencies}){
  calc.traverse(node => {
    if (node instanceof SymbolNode || node instanceof AccessorNode){
      let stat;
      // References up the tree start with #
      if (node.name[0] === '#'){
        stat = findAncestorByType({type: node.name.slice(1), prop, memo});
        memo.statsByVariableName[node.name] = stat;
      } else {
        stat = memo.statsByVariableName[node.name];
      }
      if (stat && stat.computationDetails && !stat.computationDetails.computed){
        computeStat(stat, memo);
      }
      if (stat){
        dependencies = union(dependencies, [
          stat._id || node.name,
          ...stat.dependencies
        ]);
      }
    }
  });
  return dependencies;
}
