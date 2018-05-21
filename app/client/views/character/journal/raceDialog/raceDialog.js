Template.raceDialog.events({
	"input #raceInput, change #raceInput": _.debounce(function(event){
		var value = event.currentTarget.value;
		Characters.update(this.charId, {
			$set: {race: value}
		}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	}, 300),
});

Template.raceDialog.helpers({
	race: function(){
		var char = Characters.findOne(this.charId, {fields: {race: 1}});
		return char && char.race;
	},
	color: function() {
		var char = Characters.findOne(this.charId, {fields: {color: 1}});
		if (char) return getColorClass(char.color);
	},
	stepComplete: function(){
		return Session.get("newUserExperienceStep") > 1;
	},
	showNewUserExperience: function(){
		return Session.get("newUserExperienceStep") >= 1;
	},
});
