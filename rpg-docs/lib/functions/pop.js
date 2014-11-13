// turns dot notation strings into keys of root
// argument formats:
// 157, anything -> 157
// "some.number", object -> object.some.number
// "some.function", object -> object.some.function()
// "some.function arg1 arg2", object -> object.some.function(arg1, arg2)
pop = function(input, root){

	if(typeof(input) === "string"){
		//we need root for this part
		if(root === undefined) return;

		//this is a likely to fail if the string is malformed
		try{
			//split over spaces
			var parts = input.split(" "); 

			//for each word
			for (var i = 0; i < parts.length; i++){
				//split over dots
				var str = parts[i].split(".");

				//start at root
				parts[i] = root;

				//for each word between dots
				for (var j = 0; j < str.length; j++){
					parts[i] = parts[i][str[j]];
				}
			}

			//pull the first word out, might be a function
			var func = parts.splice(0, 1)[0];

			//if it's a function, apply the arguments to it
			if(_.isFunction(func)) return +func.apply(root, parts);

			//if it's a number, return it
			if(!isNaN(func)) return +func;
		} catch (err) {
			//TODO pokemon catch statement is bad
			//"gotta catch em all"
			console.log(err);
			return;
		}
	}

	return +input;
}