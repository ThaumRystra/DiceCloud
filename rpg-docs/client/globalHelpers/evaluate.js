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

Template.registerHelper("evaluateSpellString", function(charId, spellListId, string) {
	return evaluateSpellString(charId, spellListId, string);
});

Template.registerHelper("evaluateShortString", function(charId, string) {
	if (_.isString(string)){
		return evaluateString(
			charId, string.split(/^( *[-*_]){3,} *(?:\n+|$)/m)[0]
		);
	}
});
