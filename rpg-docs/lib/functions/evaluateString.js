evaluate = function(character, string){
	if(!string) return string;
	string = string.replace(/\b[a-z]+\b/g, function(sub){
		//skill mods
		if(_.has(character.skills, sub)){
			return +character.skillMod(character.skills[sub]);
		}
		//attributes
		if(_.has(character.attributes, sub)){
			return +character.attributeValue(character.attributes[sub]);
		}
		//ability modifiers
		var abilityMods = ["strengthMod", "dexterityMod", "constitutionMod", "intelligenceMod", "wisdomMod", "charismaMod"]
		if( _.contains(abilityMods, sub) ){
			var slice = sub.slice(0, - 3);
			return +character.abilityMod(character.attributes[slice]);
		}
		if(sub === "level"){
			return +character.level();
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
	if(!string) return string;
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

evaluateEffect = function(character, effect){
	if(_.isFinite(effect.value)){
		return effect.value;
	} else if(_.isString(effect.calculation)){
		return +evaluate(character, effect.calculation);
	} else {
		return 0;
	}
}