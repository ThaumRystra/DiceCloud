Template.buffView.helpers({
	name: function() {
		return this.name
	}
});

Template.buffView.events({
	"click .buffView": function(event){
		var buffId = this._id;
		var charId = Template.parentData()._id;
		pushDialogStack({
			template: "buffDialog",
			data:     {buffId: buffId, charId: charId},
			element:   event.currentTarget,
		});
	},
});