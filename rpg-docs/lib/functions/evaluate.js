// if we want to add more functions, consider pulling out into its own file
(function() {
    math.import({
        "if": function(pred, a, b) {
            return (!!(pred)) ? a : b;
        }
    });
})();

//evaluates a calculation string
evaluate = function(charId, string, opts){
    var spellListId = opts && opts.spellListId;
	if (!string) return string;
	string = string.replace(/\b[a-z,1-9]+\b/gi, function(sub){
		//fields
		if (Schemas.Character.schema(sub)){
			return Characters.calculate.fieldValue(charId, sub);
		}
		//ability modifiers
		var abilityMods = [
			"strengthMod",
			"dexterityMod",
			"constitutionMod",
			"intelligenceMod",
			"wisdomMod",
			"charismaMod",
		];
		if (_.contains(abilityMods, sub)){
			var slice = sub.slice(0, -3);
			try {
				return Characters.calculate.abilityMod(charId, slice);
			} catch (e){
				return sub;
			}
		}
		//class levels
		if (/\w+levels?\b/gi.test(sub)){
			//strip out "level"
			var className = sub.replace(/levels?\b/gi, "");
			var cls = Classes.findOne({charId: charId, name: className});
			return cls && cls.level || sub;
		}
		//character level
		if (sub.toUpperCase()  === "LEVEL"){
			return Characters.calculate.level(charId);
		}
		//spell list stuff
        if (spellListId && sub.toUpperCase() === "DC") {
            var list = SpellLists.findOne(spellListId);
            if (list && list.saveDC){
                return evaluate(charId, list.saveDC);
            }
        }
        if (spellListId && sub.toUpperCase() === "ATTACKBONUS") {
            var list = SpellLists.findOne(spellListId);
            if (list && list.attackBonus){
                return evaluate(charId, list.attackBonus);
            }
        }
		return sub;
	});
	try {
		var result = math.eval(string);
		return result;
	} catch (e){
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

evaluateSpellString = function (charId, spellListId, string) {
    //define brackets as curly brackets around anything that isn't a curly bracket
	if (!string) return string;
	var brackets = /\{[^\{\}]*\}/g;
	var result = string.replace(brackets, function(exp){
		exp = exp.replace(/(\{|\})/g, ""); //remove curly brackets
		return evaluate(charId, exp, {spellListId});
	});
	return result;
}

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
