import computeStat from '/imports/api/creature/computation/computeStat.js';
import { parse, CompilationContext } from '/imports/parser/parser.js';
import SymbolNode from '/imports/parser/parseTree/SymbolNode.js';
import AccessorNode from '/imports/parser/parseTree/AccessorNode.js';
import ConstantNode from '/imports/parser/parseTree/ConstantNode.js';

/* Convert a calculation into a constant output and errors*/
export default function evaluateCalculation(string, memo, fn = 'reduce'){
  if (!string) return {
    context: {errors: []},
    result: new ConstantNode({value: string, type: 'string'}),
  };
  let errors = [];
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
    };
  }
  // Ensure all symbol nodes are defined and coputed
  calc.traverse(node => {
    if (node instanceof SymbolNode || node instanceof AccessorNode){
      let stat = memo.statsByVariableName[node.name];
      if (stat && !stat.computationDetails.computed){
        computeStat(stat, memo);
      }
    }
  });
  // Evaluate
  let context = new CompilationContext();
  let result = calc[fn](memo.statsByVariableName, context);
  return {result, context};
}
