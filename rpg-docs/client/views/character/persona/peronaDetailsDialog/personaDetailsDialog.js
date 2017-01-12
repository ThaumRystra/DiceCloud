Template.personaDetailsEdit.onRendered(function(){
	updatePolymerInputs(this);
});

Template.personaDetailsDialog.helpers({
	char: function() {
		return Characters.findOne(
			this._id,
			{fields: {name: 1, alignment: 1, gender: 1, race: 1, picture: 1}}
		);
	}
});

Template.personaDetailsEdit.events({
	"change #nameInput": function(event){
		var input = event.currentTarget.value;
		Characters.update(this._id, {$set: {name: input}});
	},
	"change #alignmentInput": function(event){
		var input = event.currentTarget.value;
		Characters.update(this._id, {$set: {alignment: input}});
	},
	"change #genderInput": function(event){
		var input = event.currentTarget.value;
		Characters.update(this._id, {$set: {gender: input}});
	},
	"change #raceInput": function(event){
		var input = event.currentTarget.value;
		Characters.update(this._id, {$set: {race: input}});
	},
	"change #pictureInput": function(event){
		var input = event.currentTarget.value;
		Characters.update(this._id, {$set: {picture: input}});
	},
});
