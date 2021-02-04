import computeStat from '/imports/api/creature/computation/engine/computeStat.js';
import { parse, CompilationContext } from '/imports/parser/parser.js';
import SymbolNode from '/imports/parser/parseTree/SymbolNode.js';
import AccessorNode from '/imports/parser/parseTree/AccessorNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';
import findAncestorByType from '/imports/api/creature/computation/engine/findAncestorByType.js';

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
  // Ensure all symbol nodes are defined and computed
  calc.traverse(node => {
    if (node instanceof SymbolNode || node instanceof AccessorNode){
      // References up the tree start with $
      let stat;
      if (node.name[0] === '#'){
        stat = findAncestorByType({type: node.name.slice(1), prop, memo});
        memo.statsByVariableName[node.name] = stat;
      } else {
        stat = memo.statsByVariableName[node.name];
      }
      if (stat && stat.computationDetails && !stat.computationDetails.computed){
        computeStat(stat, memo);
      }
      if (stat) dependencies.push(stat._id || node.name, ...stat.dependencies);
    }
  });
  // Evaluate
  let context = new CompilationContext();
  let result = calc[fn](memo.statsByVariableName, context);
  return {result, context, dependencies};
}
