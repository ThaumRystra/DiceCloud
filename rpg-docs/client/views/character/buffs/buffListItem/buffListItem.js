Template.buffListItem.helpers({
	name: function() {
		return this.buff.name
	}
});

Template.buffListItem.events({
	"click .buffListItem": function(event){
		var buffId = this.buff._id;
		var charId = this.buff.charId;
		pushDialogStack({
			template: "buffDialog",
			data:     {buffId: buffId, charId: charId},
			element:   event.currentTarget,
		});
	},
});