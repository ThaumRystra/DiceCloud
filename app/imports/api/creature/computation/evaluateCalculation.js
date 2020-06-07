import computeStat from '/imports/api/creature/computation/computeStat.js';
import math from '/imports/math.js';

/* Convert a calculation into a constant output and errors*/
export default function evaluateCalculation(string, memo){
  if (!string) return {errors: [], value: string};
  let errors = [];
  // Parse the string using mathjs
  let calc;
  try {
    calc = math.parse(string);
  } catch (e) {
    errors.push({
      type: 'parsing',
      message: e.message || e
    });
    return {errors, value: string};
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
  // Replace all symbols with their subtitution
  let substitutedCalc = calc.transform(
    symbolSubtitutor(memo.statsByVariableName, errors)
  );
  // Evaluate the expression to a number or return with substitutions
  try {
    let value = substitutedCalc.evaluate(memo.statsByVariableName);
    if (typeof value === 'object') value = value.toString();
    return {errors, value};
  } catch (e){
    errors.push({
      type: 'evaluation',
      message: e.message || e
    });
    let value = substitutedCalc.toString();
    return {errors, value};
  }
}

// returns a function to replace all symbols with either their resolved value
// or zero, keeping the errors
function symbolSubtitutor(scope, errors){
  return function(node){
    // mark symbol nodes that are children of function nodes to be skipped
    if (node.isFunctionNode){
      let fn = node.fn;
      if (fn && fn.isSymbolNode){
        fn.skipReplacement = true;
      }
      return node;
    } else if (node.isSymbolNode && node.skipReplacement !== true){
      //bare symbols of name "stat", should search for stat.value
      let stat = scope[node.name];
      if (stat){
        if (stat.value === undefined){
          errors.push({
            type: 'subsitution',
            message: `${node.name} does not have a value, set to 0`
          });
          return new math.ConstantNode(0);
        } else {
          return new math.ConstantNode(stat.value);
        }
      } else {
        try {
          return new math.ConstantNode(node.evaluate(scope));
        } catch (e) {
          errors.push({
            type: 'subsitution',
            message: `${node.name} not found, set to 0`
          });
          return new math.ConstantNode(0);
        }
      }
    } else if (node.isAccessorNode){
      try {
        let value = node.evaluate(scope);
        if (value === undefined) throw 'Not found';
        return new math.ConstantNode(value);
      } catch (e) {
        errors.push({
          type: 'subsitution',
          message: `${node.toString()} not found, set to 0`
        });
        return new math.ConstantNode(0);
      }
    } else {
      return node;
    }
  }
}
