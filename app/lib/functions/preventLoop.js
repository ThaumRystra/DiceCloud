preventLoop = function(inputFunction){
	var self = this;
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
	return function(){
		var result;
		var hash = _.reduce(arguments, function(memo, arg) {
			return memo + arg;
		}, "");
		//we're still evaluating this attribute, must be in a loop
		if (_.contains(visitedArgs, hash)) {
			console.warn("dependency loop detected");
			return NaN;
		} else {
			//push this hash to the list of visited hashes
			//we can't visit it again unless it returns first
			visitedArgs.push(hash);
		}
		try {
			result = inputFunction.apply(this, arguments);
		} finally{
			//this hash returns or fails, pull it from the array
			visitedArgs = _.without(visitedArgs, hash);
		}
		return result;
	};
};
