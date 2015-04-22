//evaluates a calculation string
evaluate = function(charId, string){
	if (!string) return string;
	var char = Characters.findOne(charId, {fields: {_id: 1}});
	string = string.replace(/\b[a-z]+\b/gi, function(sub){
		//fields
		if (Schemas.Character.schema(sub)){
			return char.fieldValue(sub);
		}
		//ability modifiers
		var abilityMods = [
			"STRENGTHMOD",
			"DEXTERITYMOD",
			"CONSTITUTIONMOD",
			"INTELLIGENCEMOD",
			"WISDOMMOD",
			"CHARISMAMOD",
		];
		if (_.contains(abilityMods, sub.toUpperCase())){
			var slice = sub.slice(0, -3);
			return char.abilityMod(slice);
		}
		//class levels
		if (/\w+levels?\b/gi.test(sub)){
			//strip out "level"
			var className = sub.replace(/levels?\b/gi, "");
			var cls = Classes.findOne({charId: charId, name: className});
			return cls && cls.level;
		}
		//character level
		if (sub.toUpperCase()  === "LEVEL"){
			return char.level();
		}
		return sub;
	});
	try {
		var result = math.eval(string);
		return result;
	} catch (e){
		console.log("Failed to evaluate ", string);
		return string;
	}
};

//takes a string with {calculations} and returns it with the results
//of the calculations returned in place
evaluateString = function(charId, string){
	//define brackets as curly brackets around anything that isn't a curly bracket
	if (!string) return string;
	var brackets = /\{[^\{\}]*\}/g;
	var result = string.replace(brackets, function(exp){
		exp = exp.replace(/(\{|\})/g, ""); //remove curly brackets
		return evaluate(charId, exp);
	});
	return result;
};

//returns the value of the effect if it exists,
//otherwise returns the result of the calculation if it exists,
//otherwise returns 0
evaluateEffect = function(charId, effect){
	if (_.isFinite(effect.value)){
		return effect.value;
	} else if (_.isString(effect.calculation)){
		return +evaluate(charId, effect.calculation);
	} else {
		return 0;
	}
};
