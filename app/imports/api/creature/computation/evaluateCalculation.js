import  replaceBareSymbolsWithValueAccessor from '/imports/api/creature/computation/utility/replaceBareSymbolsWithValueAccessor.js';
import computeStat from '/imports/api/creature/computation/computeStat.js';
import math from '/imports/math.js';

export default function evaluateCalculation(string, memo){
  if (!string) return string;
  // Parse the string using mathjs
  let calc;
  try {
    calc = math.parse(string);
  } catch (e) {
    console.error(e);
    return string;
  }
  // Ensure all symbol nodes are defined and coputed
  calc.traverse(node => {
    if (node.isSymbolNode){
      let stat = memo.statsByVariableName[node.name];
      if (stat && !stat.computationDetails.computed){
        computeStat(stat, memo);
      }
    }
  });
  // Ensure any bare symbols are value accessors instead
  let substitutedCalc = calc.transform(replaceBareSymbolsWithValueAccessor);
  // Evaluate the expression to a number or return with substitutions
  try {
    return substitutedCalc.evaluate(memo.statsByVariableName);
  } catch (e){
    return substitutedCalc.toString();
  }
}
