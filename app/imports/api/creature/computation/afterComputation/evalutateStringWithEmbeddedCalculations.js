import evaluateString from '/imports/api/creature/computation/afterComputation/evaluateString.js';

// Strings can have computations in bracers like so: {computation}
export default function evalutateStringWithEmbeddedCalculations(string, scope){
  console.warn('evalutateStringWithEmbeddedCalculations should be replaced with ' +
  'fetching the result from the compuations on the property doc');
	if (!string) return string;
  // Compute everything inside bracers
	return string.replace(/\{([^{}]*)\}/g, function(match, p1){
    let {result} = evaluateString(p1, scope);
    return result;
	});
}
