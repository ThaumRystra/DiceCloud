Template.moveItemDialog.onCreated(function() {
	Session.setDefault("moveItemDialogTab", "containers");
});

Template.moveItemDialog.helpers({
	selectedTab: function() {
		return Session.get("moveItemDialogTab");
	},
	characters: function() {
		var userId = Meteor.userId();
		return Characters.find(
			{
				$or: [
					{readers: userId},
					{writers: userId},
					{owner: userId},
				],
				_id: {$ne: this.charId},
			},
			{fields: {name: 1}}
		);
	},
	containers: function(){
		return Containers.find(
			{
				charId: this.charId,
				_id: {$ne: this.containerId},
			},
			{
				fields: {color: 1, name: 1},
				sort: {color: 1, name: 1},
			}
		);
	},
});

Template.moveItemDialog.events({
	"tap paper-tab": function(event) {
		Session.set("moveItemDialogTab", event.currentTarget.getAttribute("name"));
	},
	"tap #moveButton": function(event, instance) {
		var tab = Session.get("moveItemDialogTab");
		if (tab === "containers"){
			var containerId = instance.find("#containerMenu").selected;
			if (!containerId) throw "no menu selection";
			Meteor.call("moveItemToContainer", this.itemId, containerId);
		} else if (tab === "characters"){
			var characterId = instance.find("#characterMenu").selected;
			if (!characterId) throw "no menu selection";
			Meteor.call("moveItemToCharacter", this.itemId, characterId);
		} else {
			throw "Move item dialog tab is not set to containers or character," +
				" it is set to " + tab;
		}
	},
});
