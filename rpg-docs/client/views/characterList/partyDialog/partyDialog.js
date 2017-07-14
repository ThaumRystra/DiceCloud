Template.partyDialog.helpers({
	party(){
		return Parties.findOne(this._id);
	}
});

Template.partyDetails.helpers({
	getCharacters (){
		var userId = Meteor.userId();
		return Characters.find(
			{
				_id: {$in: this.characters},
				$or: [{readers: userId}, {writers: userId}, {owner: userId}],
			},
			{sort: {name: 1}}
		);
	}
});

Template.partyEdit.helpers({
	allCharacters() {
		var userId = Meteor.userId();
		return Characters.find(
			{$or: [{readers: userId}, {writers: userId}, {owner: userId}]},
			{sort: {name: 1}}
		);
	},
	charInParty(charId) {
		return _.contains(Template.parentData().characters, charId);
	},
});

Template.partyDialog.events({
	"click #deleteButton": function(event, instance){
		Parties.remove(instance.data._id);
		popDialogStack();
	},
	"click #doneEditingButton": function(event, instance){
		popDialogStack();
	},
});

Template.partyEdit.events({
	"change .inPartyCheckbox": function(event, instance){
		var currentCharacters = this.characters;
		var checked = event.currentTarget.checked;
		var charId = this._id;
		var partyId = instance.data._id;
		if (checked){
			Parties.update(partyId, {$addToSet: {characters: charId}});
		} else {
			Parties.update(partyId, {$pull: {characters: charId}});
		}
	},
	"input .partyNameInput": function(event, instance){
		var name = event.currentTarget.value;
		Parties.update(this._id, {$set: {name}}, {
			removeEmptyStrings: false,
			trimStrings: false,
		});
	},
});
