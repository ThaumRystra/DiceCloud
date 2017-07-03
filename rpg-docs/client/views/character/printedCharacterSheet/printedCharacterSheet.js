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
});
