vMixJson = function(charId){
	var char = Characters.findOne(charId);
	if (!char) {
		return JSON.stringify({
			error: "character not found"
		});
	}
	if (char.settings.viewPermission !== "public"){
		return JSON.stringify({
			error: "character is not viewable to anyone with link"
		});
	}
	var baseValue = function(attributeName){
		return Characters.calculate.attributeBase(charId, attributeName);
	};
	var attributeValue = function(attributeName){
		return Characters.calculate.attributeValue(charId, attributeName);
	};
	var skillMod = function(skillName){
		return Characters.calculate.skillMod(charId, skillName);
	};
	var damageMods = getDamageMods(charId);
	var json = [
		{attribute: "Id", value: char._id},
		{attribute: "Name", value: char.name},
		{attribute: "Source", value: "DiceCloud"},
		{attribute: "Type", value: char.race},
		{attribute: "HPBase", value: baseValue("hitPoints")},
		{attribute: "HPValue", value: attributeValue("hitPoints")},
		{attribute: "HitDice", value: getHitDiceString(charId) || ""},
		{attribute: "AC", value: attributeValue("armor")},
		{attribute: "Initiative", value: skillMod("initiative")},
		{attribute: "Speed", value: attributeValue("speed")},

		{attribute: "Str", value: attributeValue("strength")},
		{attribute: "Dex", value: attributeValue("dexterity")},
		{attribute: "Con", value: attributeValue("constitution")},
		{attribute: "Cha", value: attributeValue("charisma")},
		{attribute: "Int", value: attributeValue("intelligence")},
		{attribute: "Wis", value: attributeValue("wisdom")},

		{attribute: "DamageVulnerabilities", value: damageMods.vulnerabilities},
		{attribute: "DamageResistances", value: damageMods.resistances},
		{attribute: "DamageImmunities", value: damageMods.immunities},

		{attribute: "StrSave", value: skillMod("strengthSave")},
		{attribute: "DexSave", value: skillMod("dexteritySave")},
		{attribute: "ConSave", value: skillMod("constitutionSave")},
		{attribute: "IntSave", value: skillMod("intelligenceSave")},
		{attribute: "WisSave", value: skillMod("wisdomSave")},
		{attribute: "ChaSave", value: skillMod("charismaSave")},
		{
			attribute: "passivePerception",
			value: Characters.calculate.passiveSkill(charId, "perception"),
		},
		{attribute: "Languages", value: getLanguages(charId)},
		{attribute: "Description", value: char.description || ""},
	];
	json.push(...getSkills(charId));
	return JSON.stringify(json, null, 2);
}

var getHitDiceString = function(charId){
	var d6  = Characters.calculate.attributeBase(charId, "d6HitDice");
	var d8  = Characters.calculate.attributeBase(charId, "d8HitDice");
	var d10 = Characters.calculate.attributeBase(charId, "d10HitDice");
	var d12 = Characters.calculate.attributeBase(charId, "d12HitDice");
	var con = Characters.calculate.abilityMod(charId,"constitution");
	var string = "" +
		(d6 ? `${d6}d6 + ` : "") +
		(d8 ? `${d8}d8 + ` : "") +
		(d10 ? `${d10}d10 + ` : "") +
		(d12 ? `${d12}d12 + ` : "") +
		con;
}

var getArmorString = function(charId){
	var bases = Effects.find({
		charId: charId,
		stat: "armor",
		operation: "base",
		enabled: true,
	}).map(e => ({
		ame: e.name,
		value: evaluateEffect(charId, e),
	}));
	var base = bases.length && _.max(bases, b => b.value).name || "";
	var effects = Effects.find({
		charId: charId,
		stat: "armor",
		operation: {$ne: "base"},
		enabled: true,
	}).map(e => e.name);
	var strings = base ? [base] : [];
	strings = strings.concat(effects);
	return strings.join(", ");
}

var getDamageMods = function(charId){
	// jscs:disable maximumLineLength
	var multipliers = [
		{name: "Acid",        value: Characters.calculate.attributeValue(charId, "acidMultiplier")},
		{name: "Bludgeoning", value: Characters.calculate.attributeValue(charId, "bludgeoningMultiplier")},
		{name: "Cold",        value: Characters.calculate.attributeValue(charId, "coldMultiplier")},
		{name: "Fire",        value: Characters.calculate.attributeValue(charId, "fireMultiplier")},
		{name: "Force",       value: Characters.calculate.attributeValue(charId, "forceMultiplier")},
		{name: "Lightning",   value: Characters.calculate.attributeValue(charId, "lightningMultiplier")},
		{name: "Necrotic",    value: Characters.calculate.attributeValue(charId, "necroticMultiplier")},
		{name: "Piercing",    value: Characters.calculate.attributeValue(charId, "piercingMultiplier")},
		{name: "Poison",      value: Characters.calculate.attributeValue(charId, "poisonMultiplier")},
		{name: "Psychic",     value: Characters.calculate.attributeValue(charId, "psychicMultiplier")},
		{name: "Radiant",     value: Characters.calculate.attributeValue(charId, "radiantMultiplier")},
		{name: "Slashing",    value: Characters.calculate.attributeValue(charId, "slashingMultiplier")},
		{name: "Thunder",     value: Characters.calculate.attributeValue(charId, "thunderMultiplier")},
	];
	// jscs:enable maximumLineLength
	multipliers = _.groupBy(multipliers, "value");
	var names = o => o.name;
	return {
		"immunities": _.map(multipliers["0"], names).join(", "),
		"resistances": _.map(multipliers["0.5"], names).join(", "),
		"vulnerabilities": _.map(multipliers["2"], names).join(", "),
	};
}

var getSkills = function(charId){
	var allSkills = [
		{name: "acrobatics", attribute: "dexterity"},
		{name: "animalHandling", attribute: "wisdom"},
		{name: "arcana", attribute: "intelligence"},
		{name: "athletics", attribute: "strength"},
		{name: "deception", attribute: "charisma"},
		{name: "history", attribute: "intelligence"},
		{name: "insight", attribute: "wisdom"},
		{name: "intimidation", attribute: "charisma"},
		{name: "investigation", attribute: "intelligence"},
		{name: "medicine", attribute: "wisdom"},
		{name: "nature", attribute: "intelligence"},
		{name: "perception", attribute: "wisdom"},
		{name: "performance", attribute: "charisma"},
		{name: "persuasion", attribute: "charisma"},
		{name: "religion", attribute: "intelligence"},
		{name: "sleightOfHand", attribute: "dexterity"},
		{name: "stealth", attribute: "dexterity"},
		{name: "survival", attribute: "wisdom"},
	];
	var skills = [];
	_.each(allSkills, skill => {
		var value = Characters.calculate.skillMod(charId, skill.name);
		var mod = Characters.calculate.abilityMod(charId, skill.attribute);
		if (value !== mod){
			skills.push({"attribute": skill.name, value});
		}
	});
	return skills;
};

var getLanguages = function(charId){
	return Proficiencies.find({
		charId,
		enabled: true,
		type: "language",
	}).map(l => l.name).join(", ");
};
