roll = function(n, d){
	var result = [];
	if (!isNaN(n)){
		//if only provided 1 argument, it is the dice to roll
		if (d === undefined){
			d = n;
			n = 1;
		}
		//hard limit the number of dice rolled
		if (n > 500){
			console.warn(n + " > 500, cannot lift that many dice to roll them");
			return;
		}
		for (var i = 0; i < n; i++){
			var roll = Math.floor(Random.fraction() * d + 1);
			result.push(roll);
		}
		return result;
	}
	return result;
};
