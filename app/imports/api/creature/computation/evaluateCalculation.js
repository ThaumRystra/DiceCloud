import computedValueOfVariableName from '/imports/api/creature/computation/computedValueOfVariableName.js'
import * as math from 'mathjs';

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
  // Replace all symbols with known values
  let substitutedCalc = calc.transform(node => {
    if (node.isSymbolNode) {
      let val = computedValueOfVariableName(node.name, memo);
      if (val === null) return node;
      return new math.ConstantNode(val);
    }
    else {
      return node;
    }
  });
  // Evaluate the expression to a number or return with substitutions
  try {
    return substitutedCalc.evaluate();
  } catch (e){
    return substitutedCalc.toString();
  }
}
