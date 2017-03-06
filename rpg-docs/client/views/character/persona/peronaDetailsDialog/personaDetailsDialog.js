Template.personaDetailsDialog.helpers({
	char: function() {
		return Characters.findOne(
			this._id,
			{fields: {name: 1, alignment: 1, gender: 1, race: 1, picture: 1}}
		);
	}
});

inputHandler = (field) => _.debounce(function(event){
	var input = event.currentTarget.value;
	Characters.update(this._id, {
		$set: {[field]: input}
	}, {
		removeEmptyStrings: false,
		trimStrings: false,
	});
}, 300);

Template.personaDetailsEdit.events({
	"input #nameInput, change #nameInput": inputHandler("name"),
	"input #alignmentInput, change #alignmentInput": inputHandler("alignment"),
	"input #genderInput, change #genderInput": inputHandler("gender"),
	"input #raceInput, change #raceInput": inputHandler("race"),
	"input #pictureInput, change #pictureInput": inputHandler("picture"),
});
