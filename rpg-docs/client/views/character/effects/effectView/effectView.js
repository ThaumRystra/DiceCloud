//TODO add dexterity armor
var stats = {
	"strength":{"name":"Strength"},
	"dexterity":{"name":"Dexterity"},
	"constitution":{"name":"Constitution"},
	"intelligence":{"name":"Intelligence"},
	"wisdom":{"name":"Wisdom"},
	"charisma":{"name":"Charisma"},
	"strengthSave":{"name":"Strength Save",},
	"dexteritySave":{"name":"Dexterity Save",},
	"constitutionSave":{"name":"Constitution Save",},
	"intelligenceSave":{"name":"Intelligence Save",},
	"wisdomSave":{"name":"Wisdom Save",},
	"charismaSave":{"name":"Charisma Save",},
	"acrobatics":{"name":"Acrobatics",},
	"animalHandling":{"name":"Animal Handling",},
	"arcana":{"name":"Arcana",},
	"athletics":{"name":"Athletics",},
	"deception":{"name":"Deception",},
	"history":{"name":"History",},
	"insight":{"name":"Insight",},
	"intimidation":{"name":"Intimidation",},
	"investigation":{"name":"Investigation",},
	"medicine":{"name":"Medicine",},
	"nature":{"name":"Nature",},
	"perception":{"name":"Perception",},
	"performance":{"name":"Performance",},
	"persuasion":{"name":"Persuasion",},
	"religion":{"name":"Religion",},
	"sleightOfHand":{"name":"Sleight of Hand",},
	"stealth":{"name":"Stealth",},
	"survival":{"name":"Survival",},
	"initiative":{"name":"Initiative",},
	"hitPoints":{"name":"Hit Points"},
	"armor":{"name":"Armor"},
	"dexterityArmor":{"name":"Dexterity Armor Bonus"}
	,"speed":{"name":"Speed"},
	"proficiencyBonus":{"name":"Proficiency Bonus"},
	"ki":{"name":"Ki Points"},
	"sorceryPoints":{"name":"Sorcery Points"},
	"rages":{"name":"Rages"},
	"rageDamage":{"name":"Rage Damage"},
	"expertiseDice":{"name":"Expertise Dice"},
	"superiorityDice":{"name":"Superiority Dice"},
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
	"thunderMultiplier":{"name":"Thunder", "group": "Weakness/Resistance"}
};

var operations = {
	base: {name: "Base Value"}, 
	proficiency: {name: "Proficiency"},
	add: {name: "Add"},
	mul: {name: "Multiply"},
	min: {name: "Min"},
	max: {name: "Max"},
	advantage: {name: "Advantage"},
	disadvantage: {name: "Disadvantage"},
	passiveAdd: {name: "Passive Bonus"},
	fail: {name: "Automatically Fail"},
	conditional: {name: "Conditional Benefit"}
};

Template.effectView.helpers({
	sourceName: function(){
		var id = this.sourceId;
		if(!id) return;
		switch(this.type){
			case "feature":
				return "Feature - " + Features.findOne(id, {fields: {name: 1}}).name;
			case "class":
				return Classes.findOne(id, {fields: {name: 1}}).name;
			case "buff":
				return "Buff - " + Buffs.findOne(id, {fields: {name: 1}}).name;
			case "equipment":
				return "Equipment - " + Items.findOne(id, {fields: {name: 1}}).name;
			case "racial":
				return Characters.findOne(this.charId, {fields: {race: 1}}).race;
			case "inate":
				return "Inate"
		}
	},
	statName: function(){
		return stats[this.stat] && stats[this.stat].name || "No Stat"
	},
	operationName: function(){
		if(this.operation === "proficiency") return null;
		if(stats[this.stat].group === "Weakness/Resistance") return null;
		return operations[this.operation] && operations[this.operation].name || "No Operation"
	},
	statValue: function(){
		if(this.operation === "advantage" ||
		   this.operation === "disadvantage" ||
		   this.operation === "fail" ||
		   this.operation === "conditional"){
			return null;
		}
		if(this.operation === "proficiency"){
			if(this.value == 0.5 || this.calculation == 0.5) return "Half Proficiency";
			if(this.value == 1   || this.calculation == 1)   return "Proficiency";
			if(this.value == 2   || this.calculation == 2)   return "Double Proficiency";
		}
		if(stats[this.stat].group === "Weakness/Resistance"){
			if(this.value == 0.5 || this.calculation == 0.5) return "Resistance";
			if(this.value == 2   || this.calculation == 2)   return "Vulnerability";
			if(this.value == 0   || this.calculation == 0)   return "Immunity";
		}
		return this.calculation || this.value;
	}
});
