Template.registerHelper("signedString", function(number) {
	return number >= 0 ? "+" + number : "" + number;
});
