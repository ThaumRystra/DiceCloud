Template.characterSideList.onCreated(function() {
	this.subscribe("characterList");
});

Template.characterSideList.helpers({
	characters: function() {
		var userId = Meteor.userId();
		return Characters.find(
			{
				$or: [
					{readers: userId},
					{writers: userId},
					{owner: userId},
				]
			},
			{
				fields: {name: 1},
				sort: {name: 1},
			}
		);
	}
});

Template.characterSideList.events({
	"tap .singleLineItem": function(event, instance) {
		Router.go("characterSheet", {_id: this._id});
		$("core-drawer-panel").get(0).closeDrawer();
	},
	"tap core-item": function() {
		Router.go("characterList");
		$("core-drawer-panel").get(0).closeDrawer();
	},
});
