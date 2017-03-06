var spellLevels = [
	{name: "Cantrip", level: 0},
	{name: "Level 1",  level: 1},
	{name: "Level 2",  level: 2},
	{name: "Level 3",  level: 3},
	{name: "Level 4",  level: 4},
	{name: "Level 5",  level: 5},
	{name: "Level 6",  level: 6},
	{name: "Level 7",  level: 7},
	{name: "Level 8",  level: 8},
	{name: "Level 9",  level: 9},
];

Template.spellDialog.helpers({
	spell: function(){
		return Spells.findOne(this.spellId);
	}
});

Template.spellDialog.events({
	"color-change": function(event, instance){
		Spells.update(instance.data.spellId, {$set: {color: event.color}});
	},
	"tap #deleteButton": function(event, instance){
		Spells.softRemoveNode(instance.data.spellId);
		GlobalUI.deletedToast(instance.data.spellId, "Spells", "Spell");
		popDialogStack();
	},
});

Template.spellDetails.helpers({
	getComponents: function(){
		var components = "";
		if (this.components.concentration) components += "C";
		if (this.components.verbal) components += components.length ? ", V" : "V";
		if (this.components.somatic) components += components.length ? ", S" : "S";
		if (this.components.material) {
			components += components.length ? ", M" : "M";
			components += " (" + this.components.material + ")";
		}
		return components;
	},
	preparedString: function(){
		if (this.prepared === "prepared") return "prepared";
		if (this.prepared === "unprepared") return "unprepared";
		if (this.prepared === "always") return "always prepared";
	},
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
			{name: "Always Prepared", value: "always"},
		];
	},
});

const debounce = (f) => _.debounce(f, 300);

Template.spellEdit.events({
	"change #spellNameInput, input #spellNameInput": debounce(function(event){
		const input = event.currentTarget;
		var value = input.value;
		if (!value){
			input.invalid = true;
			input.errorMessage = "Name is required";
		} else {
			input.invalid = false;
			Spells.update(this._id, {
				$set: {name: value}
			}, {
				removeEmptyStrings: false,
				trimStrings: false,
			});
		}
	}),
	"change #castingTimeInput, input #castingTimeInput": debounce(function(event){
		var value = event.currentTarget.value;
		Spells.update(this._id, {
			$set: {castingTime: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"change #rangeInput, input #rangeInput": debounce(function(event){
		var value = event.currentTarget.value;
		Spells.update(this._id, {
			$set: {range: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"change #durationInput, input #durationInput": debounce(function(event){
		var value = event.currentTarget.value;
		Spells.update(this._id, {
			$set: {duration: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"change #materialInput, input #materialInput": debounce(function(event){
		var value = event.currentTarget.value;
		Spells.update(this._id, {
			$set: {"components.material": value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"input #descriptionInput": debounce(function(event){
		var value = event.currentTarget.value;
		Spells.update(this._id, {
			$set: {"description": value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}),
	"iron-select #listDropdown": function(event){
		var detail = event.originalEvent.detail;
		var value = detail.item.getAttribute("name");
		if (value == this.parent.id) return;
		Spells.update(this._id, {
			$set: {"parent.id": value}
		});
	},
	"iron-select #levelDropdown": function(event){
		var detail = event.originalEvent.detail;
		var value = detail.item.getAttribute("name");
		if (value == this.level) return;
		Spells.update(this._id, {$set: {level: value}});
	},
	"iron-select #schoolDropdown": function(event){
		var detail = event.originalEvent.detail;
		var value = detail.item.getAttribute("name");
		if (value == this.school) return;
		Spells.update(this._id, {$set: {school: value}});
	},
	"iron-select #preparedDropdown": function(event){
		var detail = event.originalEvent.detail;
		var value = detail.item.getAttribute("name");
		if (value == this.school) return;
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
