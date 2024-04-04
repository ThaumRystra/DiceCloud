improvedInitiativeJson = function (charId, options) {
	options = options || {
		features: true,
		attacks: true,
		description: true,
	};
	var char = Characters.findOne(charId);
	if (!char) return;
	var baseValue = function (attributeName) {
		return Characters.calculate.attributeBase(charId, attributeName);
	};
	var skillMod = function (skillName) {
		return Characters.calculate.skillMod(charId, skillName);
	};
	var damageMods = getDamageMods(charId);
	return JSON.stringify({
		"Id": char._id,
		"Name": char.name,
		"Source": "DiceCloud",
		"Type": char.race,
		"HP": {
			"Value": baseValue("hitPoints"),
			"Notes": getHitDiceString(charId) || "",
		},
		"AC": {
			"Value": baseValue("armor"),
			"Notes": getArmorString(charId) || "",
		},
		"InitiativeModifier": skillMod("initiative"),
		"Speed": ["" + baseValue("speed")],
		"Abilities": {
			"Str": baseValue("strength"),
			"Dex": baseValue("dexterity"),
			"Con": baseValue("constitution"),
			"Cha": baseValue("charisma"),
			"Int": baseValue("intelligence"),
			"Wis": baseValue("wisdom"),
		},
		"DamageVulnerabilities": damageMods.vulnerabilities,
		"DamageResistances": damageMods.resistances,
		"DamageImmunities": damageMods.immunities,
		"ConditionImmunities": [],
		"Saves": [
			{ "Name": "Str", "Modifier": skillMod("strengthSave") },
			{ "Name": "Dex", "Modifier": skillMod("dexteritySave") },
			{ "Name": "Con", "Modifier": skillMod("constitutionSave") },
			{ "Name": "Int", "Modifier": skillMod("intelligenceSave") },
			{ "Name": "Wis", "Modifier": skillMod("wisdomSave") },
			{ "Name": "Cha", "Modifier": skillMod("charismaSave") },
		],
		"Skills": getSkills(charId),
		"Senses": [
			"passive Perception " +
			Characters.calculate.passiveSkill(charId, "perception")
		],
		"Languages": getLanguages(charId),
		"Challenge": "",
		"Traits": options.features ? getTraits(charId) : [],
		"Actions": options.attacks ? getActions(charId) : [],
		"Reactions": [],
		"LegendaryActions": [],
		"Description": options.description ? char.description : "",
		"Player": Meteor.user().username,
	}, null, 2);
}

var getHitDiceString = function (charId) {
	var d6 = Characters.calculate.attributeBase(charId, "d6HitDice");
	var d8 = Characters.calculate.attributeBase(charId, "d8HitDice");
	var d10 = Characters.calculate.attributeBase(charId, "d10HitDice");
	var d12 = Characters.calculate.attributeBase(charId, "d12HitDice");
	var con = Characters.calculate.abilityMod(charId, "constitution");
	var string = "" +
		(d6 ? `${d6}d6 + ` : "") +
		(d8 ? `${d8}d8 + ` : "") +
		(d10 ? `${d10}d10 + ` : "") +
		(d12 ? `${d12}d12 + ` : "") +
		con;
}

var getArmorString = function (charId) {
	var bases = Effects.find({
		charId: charId,
		stat: "armor",
		operation: "base",
		enabled: true,
		removed: { $ne: true },
	}).map(e => ({
		ame: e.name,
		value: evaluateEffect(charId, e),
	}));
	var base = bases.length && _.max(bases, b => b.value).name || "";
	var effects = Effects.find({
		charId: charId,
		stat: "armor",
		operation: { $ne: "base" },
		enabled: true,
		removed: { $ne: true },
	}).map(e => e.name);
	var strings = base ? [base] : [];
	strings = strings.concat(effects);
	return strings.join(", ");
}

var getDamageMods = function (charId) {
	// jscs:disable maximumLineLength
	var multipliers = [
		{ name: "Acid", value: Characters.calculate.attributeValue(charId, "acidMultiplier") },
		{ name: "Bludgeoning", value: Characters.calculate.attributeValue(charId, "bludgeoningMultiplier") },
		{ name: "Cold", value: Characters.calculate.attributeValue(charId, "coldMultiplier") },
		{ name: "Fire", value: Characters.calculate.attributeValue(charId, "fireMultiplier") },
		{ name: "Force", value: Characters.calculate.attributeValue(charId, "forceMultiplier") },
		{ name: "Lightning", value: Characters.calculate.attributeValue(charId, "lightningMultiplier") },
		{ name: "Necrotic", value: Characters.calculate.attributeValue(charId, "necroticMultiplier") },
		{ name: "Piercing", value: Characters.calculate.attributeValue(charId, "piercingMultiplier") },
		{ name: "Poison", value: Characters.calculate.attributeValue(charId, "poisonMultiplier") },
		{ name: "Psychic", value: Characters.calculate.attributeValue(charId, "psychicMultiplier") },
		{ name: "Radiant", value: Characters.calculate.attributeValue(charId, "radiantMultiplier") },
		{ name: "Slashing", value: Characters.calculate.attributeValue(charId, "slashingMultiplier") },
		{ name: "Thunder", value: Characters.calculate.attributeValue(charId, "thunderMultiplier") },
	];
	// jscs:enable maximumLineLength
	multipliers = _.groupBy(multipliers, "value");
	var names = o => o.name;
	return {
		"immunities": _.map(multipliers["0"], names),
		"resistances": _.map(multipliers["0.5"], names),
		"vulnerabilities": _.map(multipliers["2"], names),
	};
}

var getSkills = function (charId) {
	var allSkills = [
		{ name: "acrobatics", attribute: "dexterity" },
		{ name: "animalHandling", attribute: "wisdom" },
		{ name: "arcana", attribute: "intelligence" },
		{ name: "athletics", attribute: "strength" },
		{ name: "deception", attribute: "charisma" },
		{ name: "history", attribute: "intelligence" },
		{ name: "insight", attribute: "wisdom" },
		{ name: "intimidation", attribute: "charisma" },
		{ name: "investigation", attribute: "intelligence" },
		{ name: "medicine", attribute: "wisdom" },
		{ name: "nature", attribute: "intelligence" },
		{ name: "perception", attribute: "wisdom" },
		{ name: "performance", attribute: "charisma" },
		{ name: "persuasion", attribute: "charisma" },
		{ name: "religion", attribute: "intelligence" },
		{ name: "sleightOfHand", attribute: "dexterity" },
		{ name: "stealth", attribute: "dexterity" },
		{ name: "survival", attribute: "wisdom" },
	];
	var skills = [];
	_.each(allSkills, skill => {
		var value = Characters.calculate.skillMod(charId, skill.name);
		var mod = Characters.calculate.abilityMod(charId, skill.attribute);
		if (value !== mod) {
			skills.push({ Name: skill.name, Modifier: value });
		}
	});
	return skills;
};

var getLanguages = function (charId) {
	return Proficiencies.find({
		charId,
		enabled: true,
		type: "language",
		removed: { $ne: true },
	}).map(l => l.name);
};

var getTraits = function (charId) {
	return Features.find(
		{
			charId: charId,
			removed: { $ne: true },
		},
		{ sort: { color: 1, name: 1 } }
	).map(f => ({
		Name: f.name,
		// evaluateShortString helper
		Content: evaluateString(
			charId, f.description && f.description.split(/^( *[-*_]){3,} *(?:\n+|$)/m)[0]
		) || "",
		Usage: "",
	}));
}

var getActions = function (charId) {
	return Attacks.find(
		{
			charId,
			enabled: true,
			removed: { $ne: true },
		},
		{ sort: { color: 1, name: 1 } }
	).map(a => ({
		Name: a.name,
		Content: `+${evaluate(charId, a.attackBonus)} to hit, ` +
			`${evaluateString(charId, a.damage)} ${a.damageType} damage, ` +
			`${a.details}`,
		Usage: "",
	}));
}
