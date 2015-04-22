Template.registerHelper("evaluate", function(charId, string) {
	return evaluate(charId, string);
});

Template.registerHelper("evaluateSigned", function(charId, string) {
	var number = evaluate(charId, string);
	if (_.isFinite(number)) {
		return number > 0 ? "+" + number : "" + number;
	} else {
		return number;
	}
});

Template.registerHelper("evaluateSignedSpaced", function(charId, string) {
	var number = evaluate(charId, string);
	if (_.isFinite(number)) {
		return number > 0 ? "+ " + number : "- " + (-1 * number);
	} else {
		return number;
	}
});

Template.registerHelper("evaluateString", function(charId, string) {
	return evaluateString(charId, string);
});
