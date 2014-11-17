getMod = function(score){
	return Math.floor((score-10)/2);
}

signedString = function(number){
	return number > 0? "+" + number : "" + number;
}