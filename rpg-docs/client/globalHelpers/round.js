Template.registerHelper("round", function(value, decimalPlaces) {
	decimalPlaces = +decimalPlaces || 2;
	var num = +value;
	var tens = Math.pow(10, decimalPlaces);
	return Math.round(num * tens) / tens;
});
