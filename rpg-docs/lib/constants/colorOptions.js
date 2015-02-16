colorOptions = {
	"red": {whiteText: true, color: "#F44336"},
	"pink": {whiteText: true, color: "#E91E63"},
	"purple": {whiteText: true, color: "#9C27B0"},
	"deep-purple": {whiteText: true, color: "#673AB7"},
	"indigo": {whiteText: true, color: "#3F51B5"},
	"blue": {whiteText: true, color: "#2196F3"},
	"light-blue": {whiteText: true, color: "#03A9F4"},
	"cyan": {whiteText: true, color: "#00BCD4"},
	"teal": {whiteText: true, color: "#009688"},
	"green": {whiteText: true, color: "#4CAF50"},
	"light-green": {whiteText: true, color: "#8BC34A"},
	"lime": {whiteText: false, color: "#CDDC39"},
	"yellow": {whiteText: false, color: "#FFEB3B"},
	"amber": {whiteText: false, color: "#FFC107"},
	"orange": {whiteText: false, color: "#FF9800"},
	"deep-orange": {whiteText: true, color: "#FF5722"},
	"grey": {whiteText: true, color: "#9E9E9E"}, //spec says no white text
	//"blue-grey": {whiteText: true, color: "#607D8B"},
	"brown": {whiteText: true, color: "#795548"},
	"black": {whiteText: true, color: "#000000"},
};

getColorClass = function(key){
	if(!key){
		return "brown white-text"
	}
	var colorClass = key;
	if(colorOptions[key].whiteText){
		colorClass += " white-text";
	}
	return colorClass;
}
