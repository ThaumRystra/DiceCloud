var spellLevels = [
	{ name: "Cantrip", level: 0 },
	{ name: "Level 1",  level: 1 },
	{ name: "Level 2",  level: 2 },
	{ name: "Level 3",  level: 3 },
	{ name: "Level 4",  level: 4 },
	{ name: "Level 5",  level: 5 },
	{ name: "Level 6",  level: 6 },
	{ name: "Level 7",  level: 7 },
	{ name: "Level 8",  level: 8 },
	{ name: "Level 9",  level: 9 },
];


Template.spellDialog.onCreated(function(){
	this.editing = new ReactiveVar(false);
});

Template.spellDialog.helpers({
	spell: function(){
		return Spells.findOne(this.spellId);
	},
	editing: function(){
		return Template.instance().editing.get();
	},
});

Template.spellDialog.events({
	"color-change": function(event, instance){
		Spells.update(instance.data.spellId, {$set: {color: event.color}});
	},
	"tap #editButton": function(event, instance){
		instance.editing.set(true);
	},
	"tap #doneEditingButton": function(event, instance){
		instance.editing.set(false);
	},
	"tap #deleteButton": function(event, instance){
		Spells.softRemoveNode(instance.data.spellId);
		GlobalUI.deletedToast(instance.data.spellId, "Spells", "Spell");
		GlobalUI.closeDetail();
	},
});

Template.spellDetails.helpers({
	getComponents: function(){
		var components = "";
		if(this.components.concentration) components += "C";
		if(this.components.verbal) components += components.length? ", V" : "V";
		if(this.components.somatic) components += components.length? ", S" : "S";
		if(this.components.material) {
			components += components.length? ", M" : "M";
			components += " (" + this.components.material + ")";
		}
		return components;
	},
	preparedString: function(){
		if(this.prepared === "prepared") return "prepared";
		if(this.prepared === "unprepared") return "unprepared";
		if(this.prepared === "always") return "always prepared";
	},
});

Template.spellEdit.onRendered(function(){
	updatePolymerInputs(this);
});

Template.spellEdit.helpers({
	spellLists: function(){
		return SpellLists.find({charId: this.charId}, {fields: {name: 1}});
	},
	magicSchools: function(){
		return magicSchools;
	},
	spellLevels: function(){
		return spellLevels;
	},
	preparedOptions: function(){
		return [
			{name: "Prepared", value: "prepared"},
			{name: "Unprepared", value: "unprepared"},
			{name: "Always Prepared", value: "always"}
		];
	}
});

Template.spellEdit.events({
	"change #spellNameInput, input #spellNameInput": function(event){
		var value = event.currentTarget.value;
		Spells.update(this._id, {$set: {name: value}});
	},
	"change #castingTimeInput": function(event){
		var value = event.currentTarget.value;
		Spells.update(this._id, {$set: {castingTime: value}});
	},
	"change #rangeInput": function(event){
		var value = event.currentTarget.value;
		Spells.update(this._id, {$set: {range: value}});
	},
	"change #durationInput": function(event){
		var value = event.currentTarget.value;
		Spells.update(this._id, {$set: {duration: value}});
	},
	"change #materialInput": function(event){
		var value = event.currentTarget.value;
		Spells.update(this._id, {$set: {"components.material": value}});
	},
	"change #descriptionInput": function(event){
		var value = event.currentTarget.value;
		Spells.update(this._id, {$set: {"description": value}});
	},
	"core-select #listDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		if (value == this.parent.id) return;
		Spells.update(this._id, {$set: {"parent.id": value}});
	},
	"core-select #levelDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		if(value == this.level) return;
		Spells.update(this._id, {$set: {level: value}});
	},
	"core-select #schoolDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		if(value == this.school) return;
		Spells.update(this._id, {$set: {school: value}});
	},
	"core-select #preparedDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		if(value == this.school) return;
		Spells.update(this._id, {$set: {prepared: value}});
	},
	"change #verbalCheckbox": function(event){
		var value = event.currentTarget.checked;
		Spells.update(this._id, {$set: {"components.verbal": value}});
	},
	"change #somaticCheckbox": function(event){
		var value = event.currentTarget.checked;
		Spells.update(this._id, {$set: {"components.somatic": value}});
	},
	"change #concentrationCheckbox": function(event){
		var value = event.currentTarget.checked;
		Spells.update(this._id, {$set: {"components.concentration": value}});
	},
	"change #ritualCheckbox": function(event){
		var value = event.currentTarget.checked;
		Spells.update(this._id, {$set: {"ritual": value}});
	},
});
