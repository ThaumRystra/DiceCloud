Template.registerHelper("colorClass", function(color){
	return color? getColorClass(color) : getColorClass(this.color);
});
