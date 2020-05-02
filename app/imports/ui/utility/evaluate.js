import Creatures from '/imports/api/creature/Creatures.js';

// Computations resolve to numbers
// vars is a dict of variables to substitute
export function evaluateComputation(string, vars){
  console.warn('Deprecated, evaluate computation should be done by the computation engine')
  if (!string) return string;
  // Replace all the string variables with numbers if possible
  let substitutedString = string.replace(
    /\w*[a-z]\w*/gi,
    sub => vars.hasOwnProperty(sub) ? vars[sub] : sub
  );

  // Evaluate the expression to a number or return it as is.
  try {
    return math.eval(substitutedString);
  } catch (e){
    return substitutedString;
  }
}

// Strings can have computations in bracers like so: {computation}
// vars is a dict of variables to substitute
export function evaluateStringWithVariables(string, vars){
  console.warn('Deprecated, evaluateStringWithVariables should be done by the computation engine')
	if (!string) return string;
  // Compute everything inside bracers
	return string.replace(/\{([^\{\}]*)\}/g, function(match, p1){
		return evaluateComputation(p1, vars);
	});
}

export function evaluateStringForCharId(string, charId){
  console.warn('Deprecated, evaluateStringForCharId should be done by the computation engine')
  let char = Creatures.findOne(charId, {fields: {variables: 1}});
  let vars = char ? char.variables : {};
  return evaluateStringWithVariables(string, vars);
}
