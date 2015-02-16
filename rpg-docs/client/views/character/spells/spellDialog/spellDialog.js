var spellLevels = [
	{ name: "Cantrips", level: 0 },
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

Template.spellDialog.rendered = function(){
	var self = this;
	//update all autogrows after they've been filled
	var pata = this.$("paper-autogrow-textarea");
	pata.each(function(index, el){
		el.update($(el).children().get(0));
	})
	//update all input fields as well
	var input = this.$("paper-input");
	input.each(function(index, el){
		el.valueChanged();
	})
	//after the dialog is built, open it
	if (!this.alreadyRendered){
		Session.set("global.ui.detailShow", true);
		this.alreadyRendered = true;
	}
}

Template.spellDialog.events({
	"tap #backButton": function(){
		GlobalUI.closeDetail();
	},
	"tap #deleteSpell": function(){
		Spells.remove(this._id);
		GlobalUI.closeDetail();
	},
	//TODO clean up String -> num here so they don't need casting by Schema.clean
	//TODO validate input (integer, non-negative, etc) for these inputs and give validation errors
	"change #spellNameInput, input #spellNameInput": function(event){
		var value = event.currentTarget.value
		Spells.update(this._id, {$set: {name: value}});
	},
	"change #castingTimeInput": function(event){
		var value = event.currentTarget.value
		Spells.update(this._id, {$set: {castingTime: value}});
	},
	"change #rangeInput": function(event){
		var value = event.currentTarget.value
		Spells.update(this._id, {$set: {range: value}});
	},
	"change #durationInput": function(event){
		var value = event.currentTarget.value
		Spells.update(this._id, {$set: {duration: value}});
	},
	"change #materialInput": function(event){
		var value = event.currentTarget.value
		Spells.update(this._id, {$set: {"components.material": value}});
	},
	"change #descriptionInput": function(event){
		var value = event.currentTarget.value
		Spells.update(this._id, {$set: {"description": value}});
	},
	"core-select #listDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		if (value == this.listId) return;
		Spells.update(this._id, {$set: {listId: value}});
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
	"core-select .colorDropdown": function(event){
		var detail = event.originalEvent.detail;
		if(!detail.isSelected) return;
		var value = detail.item.getAttribute("name");
		if(value == this.color) return;
		Spells.update(this._id, {$set: {color: value}});
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

Template.spellDialog.helpers({
	spell: function(){
		return Spells.findOne(this.spellId);
	},
	colorClass: function(){
		return getColorClass(this.color)
	},
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