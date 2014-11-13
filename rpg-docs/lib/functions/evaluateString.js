evaluate = function(character, string){
	string = string.replace(/\b[a-z]+\b/g, function(sub){
		//skill mods
		if(character.skills[sub]){
			return +character.skillMod(character.skills[sub]);
		}
		//attributes
		if(character.attributes[sub]){
			return +character.attributeValue(character.attributes[sub]);
		}
		return sub;
	});
	try{
		result = math.eval(string);
		return result
	} catch(e){
		console.log(e)
		return string;
	}	
}

evaluateString = function(character, string){
	//define brackets as curly brackets around anything that isn't a curly bracket
	var brackets = /\{[^\{\}]*\}/g;
	var result = string.replace(brackets, function(exp){
		var exp = exp.replace(/(\{|\})/g, "") //remove brackets
		var span = jQuery('<span/>', {
			title: exp,
			text: evaluate(character, exp),
			class: "calculatedValue"
		});
		return span.prop('outerHTML');
	});
	//this is going to return HTML, ensure it is santized!
	return result;
}