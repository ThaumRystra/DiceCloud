colorOptions = [
	{key: "a", className: "red", whiteText: true, color: "#F44336"},
	{key: "b", className: "pink", whiteText: true, color: "#E91E63"},
	{key: "c", className: "purple", whiteText: true, color: "#9C27B0"},
	{key: "d", className: "deep-purple", whiteText: true, color: "#673AB7"},
	{key: "e", className: "indigo", whiteText: true, color: "#3F51B5"},
	{key: "f", className: "blue", whiteText: true, color: "#2196F3"},
	{key: "g", className: "light-blue", whiteText: true, color: "#03A9F4"},
	{key: "h", className: "cyan", whiteText: true, color: "#00BCD4"},
	{key: "i", className: "teal", whiteText: true, color: "#009688"},
	{key: "j", className: "green", whiteText: true, color: "#4CAF50"},
	{key: "k", className: "light-green", whiteText: true, color: "#8BC34A"},
	{key: "l", className: "lime", whiteText: false, color: "#CDDC39"},
	{key: "m", className: "yellow", whiteText: false, color: "#FFEB3B"},
	{key: "n", className: "amber", whiteText: false, color: "#FFC107"},
	{key: "o", className: "orange", whiteText: false, color: "#FF9800"},
	{key: "p", className: "deep-orange", whiteText: true, color: "#FF5722"},
	{key: "q", className: "grey", whiteText: true, color: "#9E9E9E"}, //spec says no white text
	{key: "r", className: "blue-grey", whiteText: true, color: "#607D8B"},
	{key: "s", className: "brown", whiteText: true, color: "#795548"},
	{key: "t", className: "black", whiteText: true, color: "#000000"},
];

var colorOptionMap = _.pluck(colorOptions, "key");

getColorClass = function(key){
	if (!key){
		return "grey white-text";
	}
	var index = _.indexOf(colorOptionMap, key);
	if (index == -1){
		return "grey white-text";
	}
	var option = colorOptions[index];
	var colorClass = option.className;
	if (option.whiteText){
		colorClass += " white-text";
	}
	return colorClass;
};

getHexColor = function(key) {
	if (!key){
		return "#000";
	}
	var index = _.indexOf(colorOptionMap, key);
	if (index === -1){
		return "#000";
	}
	return colorOptions[index].color;
};
