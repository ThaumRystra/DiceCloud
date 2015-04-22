Template.personaDetailsDialog.onRendered(function(){
	updatePolymerInputs(this);
});

Template.personaDetailsDialog.events({
	"change #nameInput": function(event){
		var input = event.currentTarget.value;
		Characters.update(this.charId, {$set: {name: input}});
	},
	"change #alignmentInput": function(event){
		var input = event.currentTarget.value;
		Characters.update(this.charId, {$set: {alignment: input}});
	},
	"change #genderInput": function(event){
		var input = event.currentTarget.value;
		Characters.update(this.charId, {$set: {gender: input}});
	},
	"change #raceInput": function(event){
		var input = event.currentTarget.value;
		Characters.update(this.charId, {$set: {race: input}});
	},
});
