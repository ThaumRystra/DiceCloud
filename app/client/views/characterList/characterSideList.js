Template.characterSideList.onCreated(function() {
	this.subscribe("characterList");
	this.openedParties = new ReactiveVar(new Set());
});

Template.characterSideList.helpers({
	parties() {
		return Parties.find(
			{owner: Meteor.userId()},
			{sort: {name: 1}},
		);
	},
	charactersInParty() {
		var userId = Meteor.userId();
		return Characters.find(
			{
				_id: {$in: this.characters},
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
	isOpen(id) {
		var openedParties = Template.instance().openedParties.get();
		return openedParties.has(id);
	},
});

Template.characterSideList.events({
	"click .partyHead": function(event, instance){
		var openedParties = instance.openedParties.get();
		if (openedParties.has(this._id)){
			openedParties.delete(this._id);
		} else {
			openedParties.add(this._id);
		}
		instance.openedParties.set(openedParties);
	},
});
