var profTypes = [
	{type: "skill", name: "Skill"},
	{type: "save", name: "Saving Throw"},
	{type: "weapon", name: "Weapon"},
	{type: "armor", name: "Armor"},
	{type: "tool", name: "Tool"},
	{type: "language", name: "Language"},
];

var saves = [
	{name: "Strength Save", stat: "strengthSave"},
	{name: "Dexterity Save", stat: "dexteritySave"},
	{name: "Constitution Save", stat: "constitutionSave"},
	{name: "Intelligence Save", stat: "intelligenceSave"},
	{name: "Wisdom Save", stat: "wisdomSave"},
	{name: "Charisma Save", stat: "charismaSave"},
];

var skills = [
	{name: "Acrobatics", stat: "acrobatics"},
	{name: "Animal Handling", stat: "animalHandling"},
	{name: "Arcana", stat: "arcana"},
	{name: "Athletics", stat: "athletics"},
	{name: "Deception", stat: "deception"},
	{name: "History", stat: "history"},
	{name: "Insight", stat: "insight"},
	{name: "Intimidation", stat: "intimidation"},
	{name: "Investigation", stat: "investigation"},
	{name: "Medicine", stat: "medicine"},
	{name: "Nature", stat: "nature"},
	{name: "Perception", stat: "perception"},
	{name: "Performance", stat: "performance"},
	{name: "Persuasion", stat: "persuasion"},
	{name: "Religion", stat: "religion"},
	{name: "Sleight of Hand", stat: "sleightOfHand"},
	{name: "Stealth", stat: "stealth"},
	{name: "Survival", stat: "survival"},
	{name: "Initiative", stat: "initiative"},
];

Template.proficiencyEdit.helpers({
	proficiencyTypes: function(){
		return profTypes;
	},
	nameInputTemplate: function(){
		if (!this.type) return null;
		if (this.type === "skill" ||
			this.type === "save") return "nameDropdown";
		return "nameInput";
	},
});

Template.proficiencyEdit.events({
	"tap .deleteProficiency": function(event){
		Proficiencies.softRemoveNode(this._id);
		GlobalUI.deletedToast(this._id, "Proficiencies", "Proficiency");
	},
	"core-select .typeDropDown": function(event){
		var detail = event.originalEvent.detail;
		if (!detail.isSelected) return;
		var type = detail.item.getAttribute("name");
		if (type == this.type) return;
		Proficiencies.update(this._id, {$set: {type: type}});
	},
	"core-select .valueDropDown": function(event){
		var detail = event.originalEvent.detail;
		if (!detail.isSelected) return;
		var value = +detail.item.getAttribute("name");
		if (value == this.value) return;
		Proficiencies.update(this._id, {$set: {value: value}});
	},
	"core-select .nameDropDown": function(event){
		var detail = event.originalEvent.detail;
		if (!detail.isSelected) return;
		var name = detail.item.getAttribute("name");
		if (name == this.name) return;
		Proficiencies.update(this._id, {$set: {name: name}});
	},
	"change .nameInput": function(event){
		var name = event.currentTarget.value;
		Proficiencies.update(this._id, {$set: {name: name}});
	},
});

Template.nameDropdown.helpers({
	nameDropdownItems: function(){
		if (this.type === "skill") return skills;
		if (this.type === "save") return saves;
	}
});
