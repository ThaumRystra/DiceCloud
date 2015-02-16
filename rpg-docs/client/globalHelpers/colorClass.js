Template.registerHelper("colorClass", function(color){
	return color? getColorClass(color) : getColorClass(this.color);
});

Template.registerHelper("hexColor", function(color){
	return colorOptions[color].color;
});
