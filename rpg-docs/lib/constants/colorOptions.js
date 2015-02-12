colorOptions = {
	"red": {whiteText: true},
	"pink": {whiteText: true},
	"purple": {whiteText: true},
	"deep-purple": {whiteText: true},
	"indigo": {whiteText: true},
	"blue": {whiteText: true},
	"light-blue": {whiteText: true},
	"cyan": {whiteText: true},
	"teal": {whiteText: true},
	"green": {whiteText: true},
	"light-green": {whiteText: true},
	"lime": {whiteText: false},
	"yellow": {whiteText: false},
	"amber": {whiteText: false},
	"orange": {whiteText: false},
	"deep-orange": {whiteText: true},
	"brown": {whiteText: true},
	"grey": {whiteText: true}, //spec says no white text
	"blue-grey": {whiteText: true},
	"black": {whiteText: true},
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
