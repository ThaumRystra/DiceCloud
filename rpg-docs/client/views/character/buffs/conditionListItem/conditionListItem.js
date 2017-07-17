Template.conditionListItem.helpers({
	name: function() {
		return this.name;
	}
});

Template.conditionListItem.events({
	"click .conditionListItem": function(event){
		var buffId = this._id;
		var charId = Template.parentData()._id;
		pushDialogStack({
			template: "conditionViewDialog",
			data:     {buffId: buffId, charId: charId},
			element:   event.currentTarget,
		});
	},
});