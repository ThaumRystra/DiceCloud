import computeStat from '/imports/api/creature/computation/engine/computeStat.js';
import { parse, CompilationContext } from '/imports/parser/parser.js';
import SymbolNode from '/imports/parser/parseTree/SymbolNode.js';
import AccessorNode from '/imports/parser/parseTree/AccessorNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';
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
  let errors = [];
  if (!string) return {
    context: {errors},
    result: new ConstantNode({value: string, type: 'string'}),
    dependencies,
  };
  // Parse the string
  let calc;
  try {
    calc = parse(string);
  } catch (e) {
    errors.push({
      type: 'parsing',
      message: e.message || e
    });
    return {
      context: {errors},
      result: new ConstantNode({value: string, type: 'string'}),
      dependencies,
    };
  }
  if (!calc){
    return {
      context: {errors},
      result: new ConstantNode({value: calc, type: 'string'}),
      dependencies,
    };
  }

  // Replace constants with their parsed constant
  let replaceResults = replaceConstants({
    calc, memo, prop, dependencies, errors
  });
  dependencies = replaceResults.dependencies;
  calc = replaceResults.calc;
  if (replaceResults.failed){
    return {
      context: {errors},
      result: new ConstantNode({value: string, type: 'string'}),
      dependencies,
    };
  }

  // Ensure all symbol nodes are defined and computed
  dependencies = computeSymbols({calc, memo, prop, dependencies})

  // Evaluate
  let context = new CompilationContext();
  let result = calc[fn](memo.statsByVariableName, context);
  return {result, context, dependencies};
}

// Replace constants in the calc with the right ParseNodes
function replaceConstants({calc, memo, prop, dependencies, errors}){
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
    errors.push({
      type: 'error',
      message: `${name} is a constant property with parsing errors`
    });
  });
  return {
    failed: !!constFailed.length,
    dependencies,
    calc,
  };
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
