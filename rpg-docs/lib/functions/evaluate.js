//evaluates a calculation string
evaluate = function(charId, string){
	if(!string) return string;
	var char = Characters.findOne(charId, {fields: {_id: 1}});
	string = string.replace(/\b[a-zA-Z]+\b/g, function(sub){
		//fields
		if(Schemas.Character.schema(sub)){
			return char.fieldValue(sub)
		}
		//ability modifiers
		var abilityMods = ["strengthMod", "dexterityMod", "constitutionMod", "intelligenceMod", "wisdomMod", "charismaMod"]
		if( _.contains(abilityMods, sub) ){
			var slice = sub.slice(0, - 3);
			return char.abilityMod(slice);
		}
		if(sub === "level"){
			return char.level();
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

//takes a string with {calculations} and returns it with the results 
//of the calculations returned in place
evaluateString = function(charId, string){
	//define brackets as curly brackets around anything that isn't a curly bracket
	if(!string) return string;
	var brackets = /\{[^\{\}]*\}/g;
	var result = string.replace(brackets, function(exp){
		var exp = exp.replace(/(\{|\})/g, "") //remove brackets
		var span = jQuery('<span/>', {
			title: exp,
			text: evaluate(charId, exp),
			class: "calculatedValue"
		});
		return span.prop('outerHTML');
	});
	//this is going to return HTML, ensure it is santized!
	return result;
}

//returns the value of the effect if it exists, 
//otherwise returns the result of the calculation if it exists,
//otherwise returns 0
evaluateEffect = function(charId, effect){
	if(_.isFinite(effect.value)){
		return effect.value;
	} else if(_.isString(effect.calculation)){
		return +evaluate(charId, effect.calculation);
	} else {
		return 0;
	}
}