Template.raceDialog.events({
	"change #raceInput": function(event){
		var value = event.currentTarget.value;
		Characters.update(this.charId, {$set: {race: value}});
	}
});

Template.raceDialog.helpers({
	race: function(){
		var char = Characters.findOne(this.charId, {fields: {race: 1}});
		return char && char.race;
	}
});