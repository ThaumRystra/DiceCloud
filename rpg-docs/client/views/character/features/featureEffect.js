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
	{stat: "hitPoints", name: "Hit Points", group: "Stats"},
	{stat: "armor", name: "Armor", group: "Stats"},
	{stat: "speed", name: "Speed", group: "Stats"},
	{stat: "ki", name: "Ki Points", group: "Stats"},
	{stat: "sorceryPoints", name: "Sorcery Points", group: "Stats"},
	{stat: "rages", name: "Rages", group: "Stats"},
	{stat: "rageDamage", name: "Rage Damage", group: "Stats"},
	{stat: "expertiseDice", name: "Expertise Dice", group: "Stats"},
	{stat: "superiorityDice", name: "Superiority Dice", group: "Stats"},
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
	{stat: "thunderMultiplier", name: "Thunder", group: "Weakness/Resistance"}
];

var statsDict = _.indexBy(stats, "stat")
var statGroups = _.groupBy(stats, "group");
var statGroupNames = _.keys(statGroups);

var statGroupIndex = function(statName){
	if(!_.isString(statName)) return;
	var stat = statsDict[statName];
	if(stat){
		return _.indexOf(statGroupNames, stat.group)
	}
}

var statIndex = function(statName){
	if(!_.isString(statName)) return;
	var stat = statsDict[statName];
	if(!stat) return;
	var group = statGroups[stat.group];
	if(!group) return;
	return _.indexOf(_.pluck(group, "stat"), statName);
}

var attributeOperations = [
	{name: "Base Value", operation: "base"}, 
	{name: "Add", operation: "add"}, 
	{name: "Multiply", operation: "mul"}, 
	{name: "Min", operation: "min"}, 
	{name: "Max", operation: "max"}
];
var skillOperations = [
	{name: "Proficiency", operation: "proficiency"},
	{name: "Add", operation: "add"},
	{name: "Multiply", operation: "mul"},
	{name: "Min", operation: "min"},
	{name: "Max", operation: "max"},
	{name: "Advantage", operation: "advantage"},
	{name: "Disadvantage", operation: "disadvantage"},
	{name: "Passive Bonus", operation: "passiveAdd"},
	{name: "Automatically Fail", operation: "fail"},
	{name: "Conditional Benefit", operation: "conditional"}
];

var operationIndex = function(statName, operation){
	if(!_.isString(statName)) return;
	if(!_.isString(operation)) return;
	var group = statsDict[statName].group;
	var opGroup;
	if(group === "Saving Throws" || group === "Skills"){
		opGroup = skillOperations;
	} else {
		opGroup = attributeOperations;
	}
	return _.indexOf(_.pluck(opGroup, "operation"), operation);
}

Template.featureEffect.created = function(){
	this.selectedStatGroup = new ReactiveVar();
	this.selectedStat = new ReactiveVar();
	this.selectedOperation = new ReactiveVar();
	this.value = new ReactiveVar();
};

Template.featureEffect.rendered = function(){
	var self = this;
	self.autorun(function(){
		var data = Template.currentData();
		if(!data) return;
		if(data.stat){
			if(statsDict[data.stat]){
				self.selectedStatGroup.set(statsDict[data.stat].group);
			}
			self.selectedStat.set(data.stat);
		}
		if(data.operation){
			self.selectedOperation.set(data.operation);
		}
		var value = undefined;
		if(_.isNumber(data.value)){
			value = data.value;
		} else if (_.isString(data.calculation)){
			value = data.calculation;
		}
		if(value){
			self.value.set(value);
		}
	})
};

Template.featureEffect.helpers({
	selectedStatGroup: function(){
		var groupName = Template.instance().selectedStatGroup.get();
		return _.indexOf(statGroupNames, groupName);
	},
	selectedStat: function(){
		var statName = Template.instance().selectedStat.get();
		return statIndex(statName);
	},
	selectedOperation: function(){
		var opName = Template.instance().selectedOperation.get();
		var statName = Template.instance().selectedStat.get();
		return operationIndex(statName, opName);
	},
	statGroups: function(){
		return statGroupNames;
	},
	stats: function(){
		var group = Template.instance().selectedStatGroup.get();
		return statGroups[group];
	},
	operations: function(){
		var group = Template.instance().selectedStatGroup.get();
		if(group === "Weakness/Resistance") return null;
		if(group === "Saving Throws" || group === "Skills"){
			return skillOperations;
		} else {
			return attributeOperations;
		}
	},
	effectValueTemplate: function(){
		//resistance/vulnerability template
		var group = Template.instance().selectedStatGroup.get();
		if(group === "Weakness/Resistance") return "multiplierEffectValue";
		
		var op = Template.instance().selectedOperation.get();
		if(!op) return null;
		//operations that don't need templates
		if(op === "advantage" || op === "disadvantage" || op === "fail") return null;
		//proficiency template
		if(op === "proficiency") return "proficiencyEffectValue";
		
		//default template
		return "regularEffectValue";
	},
	needsCommit: function(){
		var inst = Template.instance();
		if(
			inst.selectedStat.get() !== this.stat ||
			inst.selectedOperation.get() !== this.operation ||
			(inst.value.get() !== this.value && inst.value.get() !== this.calculation)
		){
			return true;
		} else {
			return false;
		}
	},
	valueTemplateData: function(){
		var value = Template.instance().value.get()
		var effectValue = value;
		var selectedDamageMultiplier = null;
		if(value === 0.5) selectedDamageMultiplier = 0;
		if(value === 2) selectedDamageMultiplier = 1;
		if(value === 0) selectedDamageMultiplier = 2;
		var selectedProfiencyMultiplier = null;
		if(value === 1) selectedProfiencyMultiplier = 0;
		if(value === 0.5) selectedProfiencyMultiplier = 1;
		if(value === 2) selectedProfiencyMultiplier = 2;
		var data = {
			effectValue: effectValue,
			selectedDamageMultiplier: selectedDamageMultiplier,
			selectedProfiencyMultiplier: selectedProfiencyMultiplier
		};
		return data;
	}

});

Template.featureEffect.events({
	"tap #commitChanges": function(event){
		var newEffect = this;
		var inst = Template.instance();
		newEffect.operation = inst.selectedOperation.get();
		newEffect.stat = inst.selectedStat.get();
		var val = inst.value.get();
		if(_.isNumber(val)){
			newEffect.value = val;
			newEffect.calculation = null;
		} else if(_.isString(val)) {
			newEffect.calculation = val;
			newEffect.value = null;
		}
		Meteor.call("updateFeatureEffect", Template.parentData()._id, newEffect);
	},
	"tap #clearChanges": function(event){
		//essentially re-render
		var inst = Template.instance();
		if(this.operation) inst.selectedOperation.set(this.operation);
		if(this.stat) inst.selectedStat.set(this.stat);
		if(this.stat) inst.selectedStatGroup.set(statsDict[this.stat].group)
		var value = undefined;
		if(_.isNumber(this.value)){
			value = this.value;
		} else if (_.isString(this.calculation)){
			value = this.calculation;
		}
		inst.value.set(value);
	},
	"tap #deleteEffect": function(event){
		Features.update(Template.parentData()._id, { $pull: { "effects": {_id: this._id} } });
	},
	"core-select #statGroupMenu": function(event){
		var groupIndex = Template.instance().find("#statGroupMenu").selected;
		var groupName = statGroupNames[groupIndex]
		var oldName = Template.instance().selectedStatGroup.get();
		if(oldName != groupName){
			Template.instance().selectedStatGroup.set(groupName);
			var oldIndex = statGroupIndex(Template.instance().selectedStat.get()) 
			if(oldIndex != groupIndex){
				Template.instance().selectedStat.set(null);
			}
		}	
	},
	"core-select #statMenu": function(event){
		var statIndex = Template.instance().find("#statMenu").selected;
		var groupIndex = Template.instance().find("#statGroupMenu").selected;
		var groupName = statGroupNames[groupIndex]
		var group = statGroups[groupName];
		var statObj = group[statIndex];
		if(!statObj) return;
		var statName = statObj.stat;
		Template.instance().selectedStat.set(statName);
	},
	"core-select #operationMenu": function(event){
		var groupName = Template.instance().selectedStatGroup.get();
		var opGroup = (groupName === "Saving Throws" || groupName === "Skills")? skillOperations : attributeOperations;
		var opIndex = Template.instance().find("#operationMenu").selected;
		var op = opGroup[opIndex];
		if(!op) return;
		var opName =  op.operation;
		Template.instance().selectedOperation.set(opName);
	},
	"core-select #multiplierMenu": function(event){
		var inst = Template.instance();
		var selected = Template.instance().find("#multiplierMenu").selected;
		if(selected === 0){
			inst.value.set(0.5);
			inst.selectedOperation.set("mul");
		} else if (selected === 1){
			inst.value.set(2);
			inst.selectedOperation.set("mul");
		} else if (selected === 2){
			inst.value.set(0);
			inst.selectedOperation.set("max");
		}	
	},
	"core-select #proficiencyMenu": function(event){
		var inst = Template.instance();
		var selected = inst.find("#proficiencyMenu").selected;
		var value;
		if(selected === 0){
			inst.value.set(1);
		} else if (selected === 1){
			inst.value.set(0.5);
		} else if (selected === 2){
			inst.value.set(2);
		}
	},
	"change #effectValueInput": function(event){
		var inst = Template.instance();
		var value = inst.find("#effectValueInput").value;
		inst.value.set(value);
	}
});
