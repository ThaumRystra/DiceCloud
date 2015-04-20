Template.registerHelper("colorClass", function(color){
	if(color) return getColorClass(color);
	else if(this.color) return getColorClass(this.color);
});

Template.registerHelper("hexColor", function(color){
	return getHexColor(color);
});
