Template.registerHelper("effectList", function(obj, character){
	var result = $("<div>");
	if(_.has(obj, "conditional") && obj.conditional.length > 0){
		_.each(obj.conditional, function(cond){
			var c = $("<div>")
			.append("* ")
			.append(evaluateString(character, cond.name));
			result.append(c);
		});
	}

	if(obj.base > 0){
		var c = $("<div>")
		.append($("<span>").addClass("auditValue").append(obj.base))
		.append("Base");
		result.append(c);
	}

	if(_.has(obj, "proficiency") && obj.proficiency.length > 0){
		var highestProf = {};
		_.each(obj.proficiency, function(prof, i){
			var value = evaluateEffect(character, prof)
			if(i === 0 || value > highestProf.value){
				highestProf.value = value;
				highestProf.name = prof.name;
				highestProf.calculation = prof.calculation;
			}
		});
		var c = $("<div>")
		.append($("<span>").addClass("auditValue").append(highestProf.value).append(" x Proficiency Bonus"))
		.append(highestProf.name);
		result.append(c);
	}

	if(_.has(obj, "add") && obj.add.length > 0){
		_.each(obj.add, function(a){
			var value = signedString(evaluateEffect(character, a));
			var c = $("<div>")
			.append($("<span>").addClass("auditValue").append(value))
			.append(a.name);
			result.append(c);
		});
	}

	if(_.has(obj, "mul") && obj.mul.length > 0){
		_.each(obj.mul, function(a){
			var value = signedString(evaluateEffect(character, a));
			var c = $("<div>")
			.append($("<span>").addClass("auditValue").append("&times;").append(value))
			.append(a.name);
			result.append(c);
		});
	}

	if(_.has(obj, "min") && obj.min.length > 0){
		var highestMin = {};
		_.each(obj.min, function(m, i){
			var value = evaluateEffect(character, m)
			if(i === 0 || value > highestMin.value){
				highestMin.value = value;
				highestMin.name = m.name;
				highestMin.calculation = m.calculation;
			}
		});
		var c = $("<div>")
		.append($("<span>").addClass("auditValue").append(highestMin.value).append(" Minimum"))
		.append(highestMin.name);
		result.append(c);
	}

	if(_.has(obj, "max") && obj.max.length > 0){
		var lowestMax = {};
		_.each(obj.max, function(m, i){
			var value = evaluateEffect(character, m)
			if(i === 0 || value < lowestMax.value){
				lowestMax.value = value;
				lowestMax.name = m.name;
				lowestMax.calculation = m.calculation;
			}
		});
		var c = $("<div>")
		.append($("<span>").addClass("auditValue").append(lowestMax.value).append(" Maximum"))
		.append(lowestMax.name);
		result.append(c);
	}

	if(obj.base < 0){
		var c = $("<div>")
		.append($("<span>").addClass("auditValue").append(obj.base))
		.append("Damage");
		result.append(c);
	}

	if(_.has(obj, "advantage") && obj.advantage.length > 0){
		_.each(obj.advantage, function(adv){
			var c = $("<div>")
			.append($("<span>").addClass("auditValue").append("Advantage"))
			.append(adv.name);
			result.append(c);
		})
	}

	if(_.has(obj, "disadvantage") && obj.disadvantage.length > 0){
		_.each(obj.disadvantage, function(disadv){
			var c = $("<div>")
			.append($("<span>").addClass("auditValue").append("Disadvantage"))
			.append(disadv.name);
			result.append(c);
		})
	}

	if(_.has(obj, "fail") && obj.fail.length > 0){
		_.each(obj.fail, function(f){
			var c = $("<div>")
			.append($("<span>").addClass("auditValue").append("Fail"))
			.append(f.name);
			result.append(c);
		})
	}
	var string = result.html()
	if (_.isString(string)) return Spacebars.SafeString(string);
	return string;
});