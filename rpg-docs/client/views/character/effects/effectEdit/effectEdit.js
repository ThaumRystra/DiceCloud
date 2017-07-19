//TODO add dexterity armor
// jscs:disable maximumLineLength
var stats = [
	{stat: "strength", name: "Strength", group: "Ability Scores"},
	{stat: "dexterity", name: "Dexterity", group: "Ability Scores"},
	{stat: "constitution", name: "Constitution", group: "Ability Scores"},
	{stat: "intelligence", name: "Intelligence", group: "Ability Scores"},
	{stat: "wisdom", name: "Wisdom", group: "Ability Scores"},
	{stat: "charisma", name: "Charisma", group: "Ability Scores"},
	{name: "Strength Save", stat: "strengthSave", group: "Saving Throws"},
	{name: "Dexterity Save", stat: "dexteritySave", group: "Saving Throws"},
	{name: "Constitution Save", stat: "constitutionSave", group: "Saving Throws"},
	{name: "Intelligence Save", stat: "intelligenceSave", group: "Saving Throws"},
	{name: "Wisdom Save", stat: "wisdomSave", group: "Saving Throws"},
	{name: "Charisma Save", stat: "charismaSave", group: "Saving Throws"},
	{name: "Acrobatics", stat: "acrobatics", group: "Skills"},
	{name: "Animal Handling", stat: "animalHandling", group: "Skills"},
	{name: "Arcana", stat: "arcana", group: "Skills"},
	{name: "Athletics", stat: "athletics", group: "Skills"},
	{name: "Deception", stat: "deception", group: "Skills"},
	{name: "History", stat: "history", group: "Skills"},
	{name: "Insight", stat: "insight", group: "Skills"},
	{name: "Intimidation", stat: "intimidation", group: "Skills"},
	{name: "Investigation", stat: "investigation", group: "Skills"},
	{name: "Medicine", stat: "medicine", group: "Skills"},
	{name: "Nature", stat: "nature", group: "Skills"},
	{name: "Perception", stat: "perception", group: "Skills"},
	{name: "Performance", stat: "performance", group: "Skills"},
	{name: "Persuasion", stat: "persuasion", group: "Skills"},
	{name: "Religion", stat: "religion", group: "Skills"},
	{name: "Sleight of Hand", stat: "sleightOfHand", group: "Skills"},
	{name: "Stealth", stat: "stealth", group: "Skills"},
	{name: "Survival", stat: "survival", group: "Skills"},
	{name: "Initiative", stat: "initiative", group: "Skills"},
	{stat: "hitPoints", name: "Hit Points", group: "Stats"},
	{stat: "armor", name: "Armor", group: "Stats"},
	{stat: "dexterityArmor", name: "Dexterity Armor Bonus", group: "Stats"},
	{stat: "speed", name: "Speed", group: "Stats"},
	{stat: "proficiencyBonus", name: "Proficiency Bonus", group: "Stats"},
	{stat: "ki", name: "Ki Points", group: "Stats"},
	{stat: "sorceryPoints", name: "Sorcery Points", group: "Stats"},
	{stat: "rages", name: "Rages", group: "Stats"},
	{stat: "rageDamage", name: "Rage Damage", group: "Stats"},
	{stat: "expertiseDice", name: "Expertise Dice", group: "Stats"},
	{stat: "superiorityDice", name: "Superiority Dice", group: "Stats"},
	{stat: "carryMultiplier", name: "Carry Capacity Multiplier", group: "Stats"},
	{stat: "level1SpellSlots", name: "level 1", group: "Spell Slots"},
	{stat: "level2SpellSlots", name: "level 2", group: "Spell Slots"},
	{stat: "level3SpellSlots", name: "level 3", group: "Spell Slots"},
	{stat: "level4SpellSlots", name: "level 4", group: "Spell Slots"},
	{stat: "level5SpellSlots", name: "level 5", group: "Spell Slots"},
	{stat: "level6SpellSlots", name: "level 6", group: "Spell Slots"},
	{stat: "level7SpellSlots", name: "level 7", group: "Spell Slots"},
	{stat: "level8SpellSlots", name: "level 8", group: "Spell Slots"},
	{stat: "level9SpellSlots", name: "level 9", group: "Spell Slots"},
	{stat: "d6HitDice", name: "d6", group: "Hit Dice"},
	{stat: "d8HitDice", name: "d8", group: "Hit Dice"},
	{stat: "d10HitDice", name: "d10", group: "Hit Dice"},
	{stat: "d12HitDice", name: "d12", group: "Hit Dice"},
	{stat: "acidMultiplier", name: "Acid", group: "Weakness/Resistance"},
	{stat: "bludgeoningMultiplier", name: "Bludgeoning", group: "Weakness/Resistance"},
	{stat: "coldMultiplier", name: "Cold", group: "Weakness/Resistance"},
	{stat: "fireMultiplier", name: "Fire", group: "Weakness/Resistance"},
	{stat: "forceMultiplier", name: "Force", group: "Weakness/Resistance"},
	{stat: "lightningMultiplier", name: "Lightning", group: "Weakness/Resistance"},
	{stat: "necroticMultiplier", name: "Necrotic", group: "Weakness/Resistance"},
	{stat: "piercingMultiplier", name: "Piercing", group: "Weakness/Resistance"},
	{stat: "poisonMultiplier", name: "Poison", group: "Weakness/Resistance"},
	{stat: "psychicMultiplier", name: "Psychic", group: "Weakness/Resistance"},
	{stat: "radiantMultiplier", name: "Radiant", group: "Weakness/Resistance"},
	{stat: "slashingMultiplier", name: "Slashing", group: "Weakness/Resistance"},
	{stat: "thunderMultiplier", name: "Thunder", group: "Weakness/Resistance"},
];

// jscs:enable maximumLineLength

var statsDict = _.indexBy(stats, "stat");
var statGroups = _.groupBy(stats, "group");
statGroups["Custom Attributes"] = [];
var statGroupNames = _.keys(statGroups);

var attributeOperations = [
	{name: "Base Value", operation: "base"},
	{name: "Add", operation: "add"},
	{name: "Multiply", operation: "mul"},
	{name: "Min", operation: "min"},
	{name: "Max", operation: "max"},
];
var skillOperations = [
	{name: "Add", operation: "add"},
	{name: "Multiply", operation: "mul"},
	{name: "Min", operation: "min"},
	{name: "Max", operation: "max"},
	{name: "Advantage", operation: "advantage"},
	{name: "Disadvantage", operation: "disadvantage"},
	{name: "Passive Bonus", operation: "passiveAdd"},
	{name: "Automatically Fail", operation: "fail"},
	{name: "Conditional Benefit", operation: "conditional"},
];

Template.effectEdit.onRendered(function(){
	_.defer(() => {
		const statElement = this.find(".statMenu .iron-selected");
		statElement && statElement.scrollIntoView();
		const opElement = this.find(".operationMenu .iron-selected");
		opElement && opElement.scrollIntoView();
	});
});

Template.effectEdit.onCreated(function(){
	this.statsDict = _.clone(statsDict);
	this.statGroups = _.clone(statGroups);

	Tracker.autorun(() => {
		var cursor = CustomAttributes.find({"charID":this.charId})
		var customAttributes = cursor.map(function(attr) {
			return {
				stat : attr._id,
				name : attr.displayName,
				group : "Custom Attributes",
			}
		})
		this.statGroups["Custom Attributes"] = customAttributes;
		this.statsDict = _.extend(_.indexBy(customAttributes, "stat"), statsDict);
	})
})

Template.effectEdit.helpers({
	effect: function(){
		return Effects.findOne(this.id);
	},
	statGroups: function(){
		return statGroupNames;
	},
	stats: function(){
		var group = this;
		return Template.instance().statGroups[group];
	},
	operations: function(){
		var stat = Template.instance().statsDict[this.stat];
		var group = stat && stat.group;
		if (group === "Weakness/Resistance") return null;
		if (group === "Saving Throws" || group === "Skills"){
			return skillOperations;
		} else {
			return attributeOperations;
		}
	},
	showMultiplierOperations: function(){
		var stat = Template.instance().statsDict[this.stat];
		return stat && stat.group === "Weakness/Resistance"
	},
	showEffectValueInput: function(){
		var stat = Template.instance().statsDict[this.stat];
		var group = stat && stat.group;
		if (
			group === "Weakness/Resistance"
		) return false;
		var op = this.operation;
		if (
			!op ||
			op === "advantage" ||
			op === "disadvantage" ||
			op === "fail"
		) return false;
		return true;
	},
	effectValue: function(){
		return this.calculation || this.value;
	},
	isGroupSelected: function(groupName, statName){
		var stat = Template.instance().statsDict[statName]
		return stat && (stat.group === groupName);
	},
});

var setStat = function(statName, effectId, group){ //TODO: why do we use both effectId and this._id here? shouldn't they be the same?
	var setter = {stat: statName};
	var effect = Effects.findOne(this._id);
	if (group === "Saving Throws" || group === "Skills"){
		// Skills must have a valid skill operation
		if (!_.contains(
			_.map(skillOperations, ao => ao.operation),
			effect.operation
		)){
			setter.operation = "add";
		}
	} else if (group !== "Weakness/Resistance"){
		// Attributes must have a valid attribute operation
		if (!_.contains(
			_.map(attributeOperations, ao => ao.operation),
			effect.operation
		)){
			setter.operation = "base";
		}
	} else {
		// Weakness/Resistance must have a mul operation and value
		if (effect.operation !== "mul"){
			setter.operation = "mul";
		}
		if (!_.contains([0, 0.5, 2], effect.value)){
			setter.value = 0.5;
		}
	}
	Effects.update(effectId, {$set: setter});
};

var scrollAnimationId;
var scrollElementToView = element => {
	var scrollFunction =  function(){
		element.scrollIntoView();
		scrollAnimationId = requestAnimationFrame(scrollFunction);
	};
	return scrollFunction;
}

Template.effectEdit.events({
	"click #deleteButton": function(event, instance){
		Effects.softRemoveNode(instance.data.id);
		GlobalUI.deletedToast(instance.data.id, "Effects", "Effect");
		popDialogStack();
	},
	"click .statGroupTitle": function(event, instance){
		var groupName = this.toString();
		var firstStat = instance.statGroups[groupName][0].stat;
		setStat(firstStat, instance.data.id, groupName);
		scrollAnimationId = requestAnimationFrame(scrollElementToView(event.target));
		_.delay(() => cancelAnimationFrame(scrollAnimationId), 300);
	},
	"iron-select .statMenu": function(event, instance){
		var detail = event.originalEvent.detail;
		var statName = detail.item.getAttribute("name");
		if (statName == this.stat) return;
		setStat(statName, this._id, instance.statsDict[statName].group);
	},
	"iron-select .operationMenu": function(event){
		var detail = event.originalEvent.detail;
		var opName = detail.item.getAttribute("name");
		if (opName == this.operation) return;
		Effects.update(this._id, {$set: {operation: opName}});
	},
	"iron-select .multiplierMenu": function(event){
		var detail = event.originalEvent.detail;
		var value = +detail.item.getAttribute("name");
		if (value == this.value) return;
		Effects.update(this._id, {$set: {
			value: value,
			calculation: "",
			operation: "mul",
		}});
	},
	"change .effectValueInput, input .effectValueInput":
	_.debounce(function(event){
		var value = event.currentTarget.value;
		var numValue = value === "" ? NaN : +value;
		if (_.isFinite(numValue)){
			if (this.value === numValue) return;
			Effects.update(this._id, {
				$set: {value: numValue},
				$unset: {calculation: ""},
			});
		} else if (_.isString(value)){
			if (this.calculation === value) return;
			Effects.update(this._id, {
				$set: {calculation: value},
				$unset: {value: ""},
			}, {
				removeEmptyStrings: false,
				trimStrings: false,
			});
		}
	}, 400),
});
