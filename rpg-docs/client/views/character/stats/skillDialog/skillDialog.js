//TODO add dexterity armor
var stats = {
	"strength":{"name":"Strength"},
	"dexterity":{"name":"Dexterity"},
	"constitution":{"name":"Constitution"},
	"intelligence":{"name":"Intelligence"},
	"wisdom":{"name":"Wisdom"},
	"charisma":{"name":"Charisma"},

	"strengthSave":{"name":"Strength Save"},
	"dexteritySave":{"name":"Dexterity Save"},
	"constitutionSave":{"name":"Constitution Save"},
	"intelligenceSave":{"name":"Intelligence Save"},
	"wisdomSave":{"name":"Wisdom Save"},
	"charismaSave":{"name":"Charisma Save"},
	"allSaves": {"name":"All Saves"},

	"acrobatics":{"name":"Acrobatics"},
	"animalHandling":{"name":"Animal Handling"},
	"arcana":{"name":"Arcana"},
	"athletics":{"name":"Athletics"},
	"deception":{"name":"Deception"},
	"history":{"name":"History"},
	"insight":{"name":"Insight"},
	"intimidation":{"name":"Intimidation"},
	"investigation":{"name":"Investigation"},
	"medicine":{"name":"Medicine"},
	"nature":{"name":"Nature"},
	"perception":{"name":"Perception"},
	"performance":{"name":"Performance"},
	"persuasion":{"name":"Persuasion"},
	"religion":{"name":"Religion"},
	"sleightOfHand":{"name":"Sleight of Hand"},
	"stealth":{"name":"Stealth"},
	"survival":{"name":"Survival"},
	"initiative":{"name":"Initiative"},

	"allSkills": {"name":"All Skills"},
	"strengthSkills": {"name":"All Strength Skills"},
	"dexteritySkills": {"name":"All Dexterity Skills"},
	"constitutionSkills": {"name":"All Constitution Skills"},
	"intelligenceSkills": {"name":"All Intelligence Skills"},
	"wisdomSkills": {"name":"All Wisdom Skills"},
	"charismaSkills": {"name":"All Charisma Skills"},

	"hitPoints":{"name":"Hit Points"},
	"armor":{"name":"Armor"},
	"dexterityArmor":{"name":"Dexterity Armor Bonus"},
	"speed":{"name":"Speed"},
	"proficiencyBonus":{"name":"Proficiency Bonus"},
	"ki":{"name":"Ki Points"},
	"sorceryPoints":{"name":"Sorcery Points"},
	"rages":{"name":"Rages"},
	"rageDamage":{"name":"Rage Damage"},
	"expertiseDice":{"name":"Expertise Dice"},
	"superiorityDice":{"name":"Superiority Dice"},
	"carryMultiplier": {"name": "Carry Capacity Multiplier"},

	"level1SpellSlots":{"name":"level 1 Spell Slots"},
	"level2SpellSlots":{"name":"level 2 Spell Slots"},
	"level3SpellSlots":{"name":"level 3 Spell Slots"},
	"level4SpellSlots":{"name":"level 4 Spell Slots"},
	"level5SpellSlots":{"name":"level 5 Spell Slots"},
	"level6SpellSlots":{"name":"level 6 Spell Slots"},
	"level7SpellSlots":{"name":"level 7 Spell Slots"},
	"level8SpellSlots":{"name":"level 8 Spell Slots"},
	"level9SpellSlots":{"name":"level 9 Spell Slots"},

	"d6HitDice":{"name":"d6 Hit Dice"},
	"d8HitDice":{"name":"d8 Hit Dice"},
	"d10HitDice":{"name":"d10 Hit Dice"},
	"d12HitDice":{"name":"d12 Hit Dice"},

	"acidMultiplier":{"name":"Acid", "group": "Weakness/Resistance"},
	"bludgeoningMultiplier":{"name":"Bludgeoning", "group": "Weakness/Resistance"},
	"coldMultiplier":{"name":"Cold", "group": "Weakness/Resistance"},
	"fireMultiplier":{"name":"Fire", "group": "Weakness/Resistance"},
	"forceMultiplier":{"name":"Force", "group": "Weakness/Resistance"},
	"lightningMultiplier":{"name":"Lightning", "group": "Weakness/Resistance"},
	"necroticMultiplier":{"name":"Necrotic", "group": "Weakness/Resistance"},
	"piercingMultiplier":{"name":"Piercing", "group": "Weakness/Resistance"},
	"poisonMultiplier":{"name":"Poison", "group": "Weakness/Resistance"},
	"psychicMultiplier":{"name":"Psychic", "group": "Weakness/Resistance"},
	"radiantMultiplier":{"name":"Radiant", "group": "Weakness/Resistance"},
	"slashingMultiplier":{"name":"Slashing", "group": "Weakness/Resistance"},
	"thunderMultiplier":{"name":"Thunder", "group": "Weakness/Resistance"},
};

var operations = {
	base: {name: "Base Value"},
	proficiency: {name: "Proficiency"},
	add: {name: "&plus;"},
	mul: {name: "&times;"},
	min: {name: "Min"},
	max: {name: "Max"},
	advantage: {name: "Advantage"},
	disadvantage: {name: "Disadvantage"},
	passiveAdd: {name: "Passive Bonus"},
	fail: {name: "Automatically Fail"},
	conditional: {name: "Conditional Benefit"},
};

var abilities = {
	strength: {name: "Strength"},
	dexterity: {name: "Dexterity"},
	constitution: {name: "Constitution"},
	intelligence: {name: "Intelligence"},
	wisdom: {name: "Wisdom"},
	charisma: {name: "Charisma"},
};

const skillNames = function(skillName, charId){
	var skill = Characters.calculate.getField(charId, skillName);
	if (!skill) return [skillName];

	var isSave = !!skillName.match(/Save$/);
	if (isSave) {
		var groupNames = ["allSaves"];
	} else {
		var groupNames = [skill.ability+"Skills", "allSkills"];
	}

	var result = [skillName].concat(groupNames);
	console.log(skillName, skill, result);
	return result;
}

Template.skillDialog.helpers({
	color: function(){
		if (this.color) return this.color + " white-text";
		var char = Characters.findOne(this.charId, {fields: {color: 1}});
		if (char) return getColorClass(char.color);
	},
});

Template.skillDialogView.helpers({
	or: function(a, b, c){
		return a || b || c;
	},
	profIcon: function(){
		var prof = Characters.calculate.proficiency(this.charId, this.skillName);
		if (prof > 0 && prof < 1) return "image:brightness-2";
		if (prof === 1) return "image:brightness-1";
		if (prof > 1) return "av:album";
		return "radio-button-off";
	},
	profSource: function(){
		return Proficiencies.findOne(
			{charId: this.charId, name: this.skillName},
			{sort: {value: -1}}
		);
	},
	profBonus: function(){
		var char = Characters.findOne(this.charId);
		if (!char) return;
		var prof = Characters.calculate.proficiency(this.charId, this.skillName);
		var proficiencyBonus =
			Characters.calculate.attributeValue(this.charId, "proficiencyBonus");
		return prof * proficiencyBonus;
	},
	proficiencyValue: function(){
		var prof = Characters.calculate.proficiency(this.charId, this.skillName);
		if (prof == 0.5) return "Half Proficiency";
		if (prof == 1)   return "Proficient";
		if (prof == 2)   return "Double Proficiency";
		return prof + "x Proficiency";
	},
	addEffects: function(){
		var names=skillNames(this.skillName, this.charId);
		return Effects.find({
			charId: this.charId,
			stat: {$in: names},
			operation: "add",
			enabled: true,
		});
	},
	mulEffects: function(){
		var names=skillNames(this.skillName, this.charId);
		return Effects.find({
			charId: this.charId,
			stat: {$in: names},
			operation: "mul",
			enabled: true,
		});
	},
	minEffects: function(){
		var names=skillNames(this.skillName, this.charId);
		return Effects.find({
			charId: this.charId,
			stat: {$in: names},
			operation: "min",
			enabled: true,
		});
	},
	maxEffects: function(){
		var names=skillNames(this.skillName, this.charId);
		return Effects.find({
			charId: this.charId,
			stat: {$in: names},
			operation: "max",
			enabled: true,
		});
	},
	advEffects: function(){
		var names=skillNames(this.skillName, this.charId);
		return Effects.find({
			charId: this.charId,
			stat: {$in: names},
			operation: "advantage",
			enabled: true,
		});
	},
	dadvEffects: function(){
		var names=skillNames(this.skillName, this.charId);
		return Effects.find({
			charId: this.charId,
			stat: {$in: names},
			operation: "disadvantage",
			enabled: true,
		});
	},
	conditionalEffects: function(){
		var names=skillNames(this.skillName, this.charId);
		return Effects.find({
			charId: this.charId,
			stat: {$in: names},
			operation: "conditional",
			enabled: true,
		});
	},
	passiveEffects: function(){
		var names=skillNames(this.skillName, this.charId);
		return Effects.find({
			charId: this.charId,
			stat: {$in: names},
			operation: "passiveAdd",
			enabled: true,
		});
	},
	showPassiveTotal: function(){
		if (this.skillName === "perception") return true;
		var names=skillNames(this.skillName, this.charId);
		return Effects.find({
			charId: this.charId,
			stat: {$in: names},
			operation: "passiveAdd",
			enabled: true,
		}).count();
	},
	ability: function(){
		var opts = {fields: {}};
		opts.fields[this.skillName] = 1;
		var char = Characters.findOne(this.charId, opts);
		var skill = char && char[this.skillName];
		return skill.ability;
	},
	abilityName: function(){
		var skill = Characters.calculate.getField(this.charId, this.skillName);
		if (!skill) return;
		var ability = skill.ability;
		return abilities[ability] && abilities[ability].name;
	},
	sourceName: function(){
		if (this.parent.collection === "Characters"){
			if (this.parent.group === "racial"){
				return Characters.calculate.getField(this.charId, "race") || "Race";
			}
			if (this.parent.group === "background"){
				return "Background";
			}
			return "Innate";
		}
		return this.getParent().name;
	},
	operationName: function(){
		if (stats[this.stat].group === "Weakness/Resistance") return null;
		return operations[this.operation] &&
			operations[this.operation].name ||
			"No Operation";
	},
	statValue: function(){
		if (
			this.operation === "advantage" ||
			this.operation === "disadvantage" ||
			this.operation === "fail"
		){
			return null;
		}
		if (stats[this.stat].group === "Weakness/Resistance"){
			if (this.value === 0.5) return "Resistance";
			if (this.value === 2)   return "Vulnerability";
			if (this.value === 0)   return "Immunity";
			return " Damage x" + this.value;
		}
		return evaluate(this.charId, this.calculation) || this.value;
	},
});
