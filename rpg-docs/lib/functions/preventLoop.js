preventLoop = function(inputFunction){
	if (!_.isFunction(inputFunction)){
		throw new Meteor.Error(
			"Not a function",
			"preventLoop can only take a function as an argument"
		);
	}
	//store a private array of arguments we have been given without returning
	//if we try to visit the same argument twice before resolving its value
	//we are in a dependency loop and need to GTFO
	var visitedArgs = [];
	return function(argument){
		var value;
		//we're still evaluating this attribute, must be in a loop
		if (_.contains(visitedArgs, argument)) {
			console.warn("dependency loop detected");
			return NaN;
		} else {
			//push this skill to the list of visited skills
			//we can't visit it again unless it returns first
			visitedArgs.push(argument);
		}
		try {
			value = inputFunction.call(this, argument);
		} finally{
			//this argument returns or fails, pull it from the array
			visitedArgs = _.without(visitedArgs, argument);
		}
		return value;
	};
};
