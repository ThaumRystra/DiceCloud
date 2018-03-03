Template.printedCharacterSheet.onRendered(function(){
	// Quickfit is only called once on rendering, text will not resize reactively
	this.$(".shrink-to-fit").quickfit({
		min: 7,
		max: 36,
		truncate: true,
	});
});

Template.printedCharacterSheet.helpers({
	character(){
		return Characters.findOne(this._id);
	},
	classes: function(){
		return Classes.find({charId: this._id}, {sort: {createdAt: 1}});
	},
	weaponProfs: function(){
		var profs = Proficiencies.find({charId: this._id, type: "weapon"});
		return removeDuplicateProficiencies(profs);
	},
	armorProfs: function(){
		var profs = Proficiencies.find({charId: this._id, type: "armor"});
		return removeDuplicateProficiencies(profs);
	},
	toolProfs: function(){
		var profs = Proficiencies.find({charId: this._id, type: "tool"});
		return removeDuplicateProficiencies(profs);
	},
});

Template.printedCharacterSheet.events({
	"click .printButton": function(event, instance){
		print();
	},
	"click .backButton": function(event, instance){
		history && history.back();
	},
});
