Template.characterList.helpers({
	characters() {
		var userId = Meteor.userId();
		return Characters.find(
			{$or: [{readers: userId}, {writers: userId}, {owner: userId}]},
			{sort: {name: 1}}
		);
	},
	parties() {
		return Parties.find(
			{owner: Meteor.userId()},
			{sort: {name: 1}},
		);
	},
	charactersInParty(partyId) {
		var userId = Meteor.userId();
		var party = Parties.findOne(partyId);
		return Characters.find(
			{
				_id: {$in: party.characters},
				$or: [{readers: userId}, {writers: userId}, {owner: userId}],
			},
			{sort: {name: 1}}
		);
	},
	charactersWithNoParty() {
		var userId = Meteor.userId();
		var charArrays = Parties.find({owner: userId}).map(p => p.characters);
		var partyChars = _.uniq(_.flatten(charArrays));
		return Characters.find(
			{
				_id: {$nin: partyChars},
				$or: [{readers: userId}, {writers: userId}, {owner: userId}],
			},
			{sort: {name: 1}}
		);
	},
});

Template.characterCard.helpers({
	initials(name){
		return name.replace(/[^A-Z]/g, "");
	},
});

Template.characterList.events({
	"click .partyHeader": function(event, instance){
		pushDialogStack({
			template: "partyDialog",
			data:     {
				_id: this._id,
				startEditing: true,
			},
			element:   event.currentTarget.parentElement,
		});
	},
	"click .addCharacter": function(event, instance) {
		pushDialogStack({
			template: "newCharacterDialog",
			element: event.currentTarget,
			callback(character){
				if (!character) return;
				character.owner = Meteor.userId();
				let _id = Characters.insert(character);
				let urlName = getSlug(character.name, {maintainCase: true}) || "-"
				Router.go("characterSheet", {_id, urlName});
			},
		})
	},
	"click .addParty": function(event, instance) {
		var partyId = Parties.insert({
			owner: Meteor.userId(),
		});
		pushDialogStack({
			template: "partyDialog",
			data:     {
				_id: partyId,
				startEditing: true,
			},
			element:   event.currentTarget,
			returnElement: instance.find(`.party[data-id='${partyId}']`),
		});
	},
});
