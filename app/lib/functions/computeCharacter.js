getCharacterForComputation = function (charId) {
	const character = Characters.findOne(charId);
	const classes = Classes.find({
		charId,
		removed: { $ne: true },
	}).fetch();
	const effects = Effects.find({
		charId,
		enabled: true,
		removed: { $ne: true },
	}).fetch();
	const proficiencies = Proficiencies.find({
		charId,
		enabled: true,
		type: { $in: ["skill", "save"] },
		removed: { $ne: true },
	}).fetch();
	return { character, classes, effects, proficiencies };
}

computeCharacter = function ({ character, classes, effects, proficiencies }) {
	var charId = character._id;
	let computedClasses = computeCharacterClasses(charId, classes);
	let changed = false;
	computedCharacter = {};
	let i;
	for (i = 0; i < 15; i++) {
		[computedCharacter, changed] = compute({
			classes: computedClasses,
			oldChar: computedCharacter,
			charId,
			character,
			effects,
			proficiencies,
		});
		if (!changed) break;
	}
	return computedCharacter;
};

var ensureCharacterExists = (character) => {
	if (!character) {
		throw new Meteor.Error("Character doesn't exist",
			"You can't recompute a character that doesn't exist");
	}
};

var ensureWritePermissions = (character, userId) => {
	if (
		userId &&
		userId !== character.owner &&
		!_.contains(character.writers, userId)
	) {
		throw new Meteor.Error("Character write denied",
			"You don't have permission to recompute this character");
	}
};

var computeCharacterClasses = function (charId, classes) {
	let computedClasses = {};
	_.each(classes, (cls) => {
		if (computedClasses[cls.name]) {
			computedClasses[cls.name].level += cls.level;
		} else {
			computedClasses[cls.name] = cls;
		}
	});
	return computedClasses;
}

var compute = function ({
	charId, oldChar, character, classes, effects, proficiencies,
}) {
	let newChar = {};
	_.each(effects, (effect, index) => {
		if (!effect.stat || effect.operation === "conditional") return;
		if (!newChar[effect.stat]) newChar[effect.stat] = defaultStat();
		let value = effect.calculation ?
			computeEffect(effect.calculation, oldChar, classes) :
			effect.value || 0;
		let stat = newChar[effect.stat];
		if (!_.isNumber(value)) return;
		switch (effect.operation) {
			case "base":
				if (value > stat.base) stat.base = value;
				break;
			case "proficiency":
				if (value > stat.proficiency) stat.proficiency = value;
				break;
			case "add":
				stat.add += value;
				break;
			case "mul":
				stat.mul *= value;
				break;
			case "min":
				if (value > stat.min) stat.min = value;
				break;
			case "max":
				if (value < stat.max) stat.max = value;
				break;
			case "advantage":
				stat.advantage++;
				break;
			case "disadvantage":
				stat.disadvantage++;
				break;
			case "passiveAdd":
				stat.passiveAdd += value;
				break;
			case "fail":
				stat.fail = true;
				break;
		}
	});
	_.each(proficiencies, proficiency => {
		if (!proficiency.name) return;
		if (!newChar[proficiency.name]) newChar[proficiency.name] = defaultStat();
		let stat = newChar[proficiency.name];
		let value = proficiency.value;
		if (value > stat.proficiency) stat.proficiency = value;
	});
	let changed = false;
	_.each(ATTRIBUTES, function (statName) {
		if (!newChar[statName]) newChar[statName] = defaultStat();
		let stat = newChar[statName];
		stat.value = (stat.base + stat.add) * stat.mul;
		if (stat.value < stat.min) stat.value = stat.min;
		if (stat.value > stat.max) stat.value = stat.max;
		if (!_.isEqual(stat.value, oldChar[statName] && oldChar[statName].value)) {
			changed = true;
		}
	});
	_.each(ALL_SKILLS, function (statName) {
		if (!newChar[statName]) newChar[statName] = defaultStat();
		let stat = newChar[statName];
		stat.value = characterAbilityMod(
			oldChar, character[statName] && character[statName].ability
		);
		stat.value += stat.base + stat.add;
		stat.value += stat.proficiency *
			characterFieldValue(oldChar, "proficiencyBonus");
		stat.value *= stat.mul;
		if (stat.value < stat.min) stat.value = stat.min;
		if (stat.value > stat.max) stat.value = stat.max;
		if (!_.isEqual(stat.value, oldChar[statName] && oldChar[statName].value)) {
			changed = true;
		}
	});
	return [newChar, changed];
};

var defaultStat = function () {
	return {
		base: 0,
		proficiency: 0,
		add: 0,
		mul: 1,
		min: Number.NEGATIVE_INFINITY,
		max: Number.POSITIVE_INFINITY,
		advantage: 0,
		disadvantage: 0,
		passiveAdd: 0,
		fail: false,
	}
}

var computeEffect = function (string, character, classes) {
	if (!string) return string;
	string = string.replace(/\b[a-z][\w]+/gi, function (sub) {
		//fields
		if (character[sub]) {
			return characterFieldValue(character, sub);
		}
		//ability modifiers
		if (_.contains(ABILITY_MODS, sub)) {
			var slice = sub.slice(0, -3);
			return getMod(
				character[slice] ? characterFieldValue(character, slice) : 0
			);
		}
		//class levels
		if (/\w+levels?\b/gi.test(sub)) {
			//strip out "level"
			var className = sub.replace(/levels?\b/gi, "");
			return characterClassLevel(classes, className)
		}
		//character level
		if (sub.toUpperCase() === "LEVEL") {
			return characterTotalLevel(classes);
		}
		// exclude math functions
		if (math[sub]) {
			return sub;
		}
		return 0;
	});
	try {
		var result = math.eval(string);
		return result;
	} catch (e) {
		return string;
	}
};

var characterFieldValue = function (character, field) {
	if (_.isNumber(character[field] && character[field].value)) {
		return character[field].value;
	} else {
		return field;
	}
};

var characterClassLevel = function (classes, className) {
	if (_.isNumber(classes[className] && classes[className].level)) {
		return classes[className].level;
	} else {
		return className;
	}
};

var characterTotalLevel = function (classes) {
	return _.reduce(classes, (memo, cls) => memo + cls.level, 0);
};

var characterAbilityMod = function (character, abilityName) {
	if (_.isNumber(character[abilityName] && character[abilityName].value)) {
		return getMod(character[abilityName].value);
	} else {
		return 0;
	}
};
