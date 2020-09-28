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
  "dragover .characterRepresentative, dragenter .characterRepresentative":
	function(event, instance){
		if (_.contains(event.originalEvent.dataTransfer.types, "dicecloud-id/items")){
			event.preventDefault();
		}
	},
  "drop .characterRepresentative": function(event, instance) {
		if (_.contains(event.originalEvent.dataTransfer.types, "dicecloud-id/items")){
			var itemId = event.originalEvent.dataTransfer.getData("dicecloud-id/items");
			if (event.ctrlKey){
				//split the stack to the container
				pushDialogStack({
					template: "splitStackDialog",
					data: {
						id: itemId,
						parentCollection: "Characters",
						parentId: this._id,
					},
				});
			} else {
				//move item to the character
				Meteor.call("moveItemToCharacter", itemId, this._id);
			}
			Session.set("inventory.dragItemId", null);
		}
	},
});
