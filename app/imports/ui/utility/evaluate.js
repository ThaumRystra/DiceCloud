// Computations resolve to numbers
// vars is a dict of variables to substitute
function evaluateComputation(string, vars){
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
};

// Strings can have computations in bracers like so: {computation}
// vars is a dict of variables to substitute
function evaluateString(string, vars){
	if (!string) return string;
  // Compute everything inside bracers
	return string.replace(/\{([^\{\}]*)\}/g, function(match, p1){
		return evaluateComputation(p1, vars);
	});
}

export { evaluateComputation, evaluateString };
