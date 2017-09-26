characterExport = function(charId){
	var {
		character, classes, effects, proficiencies,
	} = getCharacterForComputation(charId);
	var char = character;
	computedCharacter = computeCharacter({
		character, classes, effects, proficiencies,
	});
	if (!char) {
		return {
			error: charId + " character not found"
		};
	}
	if (char.settings.viewPermission !== "public" && Meteor.isServer){
		return {
			error: charId + " character is not viewable to anyone with link"
		};
	}
	var baseValue = function(attributeName){
		var attribute = computedCharacter[attributeName];
		return attribute && attribute.value;
	};
	var attributeValue = function(attributeName){
		var base = baseValue(attributeName);
		var adjustment = char[attributeName] && char[attributeName].adjustment;
		return base + adjustment;
	};
	var abilityMod = function(attributeName){
		return signedString(getMod(attributeValue(attributeName)));
	};
	var skillMod = function(skillName){
		return signedString(baseValue(skillName));
	};
	var proficiency = function(skillName){
		var skill = computedCharacter[skillName];
		return skill && skill.proficiency;
	};
	var passiveSkill = function(skillName){
		var attribute = computedCharacter[skillName];
		if (!attribute) return;
		return 10 + baseValue(skillName) + attribute.passiveAdd;
	};
	var experience = function(){
		var xp = 0;
		Experiences.find(
			{charId: charId},
			{fields: {value: 1}}
		).forEach(function(e){
			xp += e.value;
		});
		return xp;
	};
	var getClasses = function(){
		return _.map(classes, c => `${c.name} ${c.level}`).join(", ");
	};
	var getHitDiceString = function(){
		var d6  = baseValue("d6HitDice");
		var d8  = baseValue("d8HitDice");
		var d10 = baseValue("d10HitDice");
		var d12 = baseValue("d12HitDice");
		var con = abilityMod("constitution");
		var string = "" +
			(d6 ? `${d6}d6 + ` : "") +
			(d8 ? `${d8}d8 + ` : "") +
			(d10 ? `${d10}d10 + ` : "") +
			(d12 ? `${d12}d12 + ` : "") +
			con;
		return string;
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
		var skills = {};
		_.each(allSkills, skill => {
			var value = skillMod(skill.name);
			var prof = proficiency(skill.name);
			var name = skill.name.charAt(0).toUpperCase() + skill.name.slice(1);
			skills[name] = value;
			skills[name + "Proficiency"] = prof;
		});
		return skills;
	};
	var character = {
		"Id": char._id,
		"Name": char.name,
		"Source": "DiceCloud",
		"Alignment": char.alignment || "",
		"Gender": char.gender || "",
		"Race": char.race || "",
		"Level": _.reduce(classes, (memo, cls) => memo + cls.level, 0),
		"Experience": experience(),
		"Class": getClasses(charId),
		"HPBase": baseValue("hitPoints"),
		"HPValue": attributeValue("hitPoints"),
		"HitDice": getHitDiceString(charId) || "",
		"AC": attributeValue("armor"),
		"Initiative": skillMod("initiative"),
		"Speed": attributeValue("speed"),
		"ProficiencyBonus": attributeValue("proficiencyBonus"),
		"passivePerception": passiveSkill("perception"),

		"Languages": getLanguages(charId),
		"Description": char.description || "",
		"Backstory": char.backstory || "",
		"Personality": char.personality || "" ,
		"Bonds": char.bonds || "",
		"Ideals": char.ideals || "",
		"Flaws": char.flaws || "",
		"PictureURL": char.picture || "",

		"Strength": attributeValue("strength"),
		"Dexterity": attributeValue("dexterity"),
		"Constitution": attributeValue("constitution"),
		"intelligence": attributeValue("intelligence"),
		"Wisdom": attributeValue("wisdom"),
		"Charisma": attributeValue("charisma"),

		"StrengthMod": abilityMod("strength"),
		"DexterityMod": abilityMod("dexterity"),
		"ConstitutionMod": abilityMod("constitution"),
		"intelligenceMod": abilityMod("intelligence"),
		"WisdomMod": abilityMod("wisdom"),
		"CharismaMod": abilityMod("charisma"),

		//"DamageVulnerabilities": damageMods.vulnerabilities,
		//"DamageResistances": damageMods.resistances,
		//"DamageImmunities": damageMods.immunities,

		"StrengthSave": skillMod("strengthSave"),
		"StrengthSaveProficiency": proficiency("strengthSave"),
		"DexteritySave": skillMod("dexteritySave"),
		"DexteritySaveProficiency": proficiency("dexteritySave"),
		"ConstitutionSave": skillMod("constitutionSave"),
		"ConstitutionSaveProficiency": proficiency("constitutionSave"),
		"intelligenceSave": skillMod("intelligenceSave"),
		"intelligenceSaveProficiency": proficiency("intelligenceSave"),
		"WisdomSave": skillMod("wisdomSave"),
		"WisdomSaveProficiency": proficiency("wisdomSave"),
		"CharismaSave": skillMod("charismaSave"),
		"CharismaSaveProficiency": proficiency("charismaSave"),

		"Level1SpellSlots": attributeValue("level1SpellSlots"),
		"Level2SpellSlots": attributeValue("level2SpellSlots"),
		"Level3SpellSlots": attributeValue("level3SpellSlots"),
		"Level4SpellSlots": attributeValue("level4SpellSlots"),
		"Level5SpellSlots": attributeValue("level5SpellSlots"),
		"Level6SpellSlots": attributeValue("level6SpellSlots"),
		"Level7SpellSlots": attributeValue("level7SpellSlots"),
		"Level8SpellSlots": attributeValue("level8SpellSlots"),
		"Level9SpellSlots": attributeValue("level9SpellSlots"),
		"Ki": attributeValue("ki"),
		"Rages": attributeValue("rages"),
		"RageDamage": attributeValue("rageDamage"),
		"SorceryPoints": attributeValue("sorceryPoints"),

		"DeathSavePasses": char.deathSave.pass,
		"DeathSaveFails": char.deathSave.fail,
		"DeathSaveStable": char.deathSave.stable,
	};
	_.extend(character, getSkills(charId));
	_.extend(character, getAttacks(charId));
	return character;
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
/*
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
*/

var getLanguages = function(charId){
	return Proficiencies.find({
		charId,
		enabled: true,
		type: "language",
	}).map(l => l.name).join(", ");
};

var getAttacks = function(charId){
	var attacks = {};
	var i = 1;
	Attacks.find(
		{charId, enabled: true},
		{sort: {color: 1, name: 1}}
	).forEach(a => {
		attacks[`Attack${i++}`] = a.name +
			` +${evaluate(charId, a.attackBonus)} to hit, ` +
			`${evaluateString(charId, a.damage)} ${a.damageType} damage, ` +
			`${a.details}`;
	});
	return attacks;
};

var signedString = function(number) {
	return number >= 0 ? "+" + number : "" + number;
};
