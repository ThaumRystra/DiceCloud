Template.registerHelper("evaluate", function(charId, string){
	return evaluate(charId, string);
});

Template.registerHelper("evaluateSigned", function(charId, string){
	var number = evaluate(charId, string);
	return number > 0? "+" + number : "" + number;
});
