Template.conditionView.helpers({
	name: function() {
		return this.name;
	}
});

Template.conditionView.events({
	"click .conditionView": function(event){
		var conditionId = this._id;
		var charId = Template.parentData()._id;
		pushDialogStack({
			template: "conditionViewDialog",
			data:     {conditionId: conditionId, charId: charId},
			element:   event.currentTarget,
		});
	},
});
