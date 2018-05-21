Template.characterPicker.onCreated(function() {
	this.subscribe("characterList");
	this.openedParties = new ReactiveVar(new Set());
});

Template.characterPicker.helpers({
	parties() {
		return Parties.find(
			{owner: Meteor.userId()},
			{sort: {name: 1}},
		);
	},
	charactersInParty() {
		var userId = Meteor.userId();
		var selector = {
			_id: {$in: this.characters, $ne: this.selfId},
			$or: [{readers: userId}, {writers: userId}, {owner: userId}],
		};
		if (this.writableOnly) {
			selector.$or = [{writers: userId}, {owner: userId}];
		}
		return Characters.find(selector,{sort: {name: 1}});
	},
	charactersWithNoParty() {
		var userId = Meteor.userId();
		var charArrays = Parties.find({owner: userId}).map(p => p.characters);
		var partyChars = _.uniq(_.flatten(charArrays));
		var selector = {
			_id: {$nin: partyChars, $ne: this.selfId},
			$or: [{readers: userId}, {writers: userId}, {owner: userId}],
		};
		if (this.writableOnly) {
			selector.$or = [{writers: userId}, {owner: userId}];
		}
		return Characters.find(selector, {sort: {name: 1}});
	},
	isOpen(id) {
		var openedParties = Template.instance().openedParties.get();
		return openedParties.has(id);
	},
});

Template.characterPicker.events({
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
