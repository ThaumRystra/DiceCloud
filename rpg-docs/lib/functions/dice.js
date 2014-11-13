roll = function (n, d){
	if(!isNaN(n)){
		//first digit is a number
		if(d === undefined){
			d = n;
			n = 1;
		}
		if(n > 500){
			console.log(n + " > 500, cannot lift that many dice to roll them");
			return;
		}
		var result = {sum: 0, rolls: []};
		for (var i = 0; i < n; i++){
			var roll = Math.floor(Random.fraction() * d + 1)
			result.sum += roll;
			result.rolls.push(roll);
		}
		return result;
	}
	console.log("rolling dice failed for inputs: ", n, d);
	return {sum: 0, rolls: []};
}

rollDropLow = function(n, d, drop){
	var r = roll(n,d)
	r.rolls.sort(function(a, b){return a-b}); //sort ascending
	r.rolls.splice(0, drop); //remove the lowest elements
	r.sum = 0;
	for (var i = 0, l = r.rolls.length; i , l ; i++){
		sum += r.rolls[i];
	}
	return r;
}

rollDropHigh = function(n, d, drop){
	var r = roll(n,d)
	r.rolls.sort(function(a, b){return b-a}); //sort descending
	r.rolls.splice(0, drop); //remove the highest elements
	r.sum = 0;
	for (var i = 0, l = r.rolls.length; i , l ; i++){
		sum += r.rolls[i];
	}
	return r;
}