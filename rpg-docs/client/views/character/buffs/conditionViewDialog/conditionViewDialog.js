Template.conditionViewDialog.helpers({
	condition: function(){
		return Conditions.findOne(this.conditionId);
	},
});

Template.conditionViewDialog.events({
	"click #deleteButton": function(event, instance){
		Conditions.remove(instance.data.conditionId);
		popDialogStack();
	},
});