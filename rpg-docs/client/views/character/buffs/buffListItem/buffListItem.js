Template.buffListItem.helpers({
	name: function() {
		return this.name;
	}
});

Template.buffListItem.events({
	"click .buffListItem": function(event){
		openParentDialog({
			parent: this.parent,
			charId: this.charId,
			element: event.currentTarget,
		});
	},
});