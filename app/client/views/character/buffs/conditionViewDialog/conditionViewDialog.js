Template.conditionViewDialog.events({
	"click #deleteButton": function(event, instance){
		Conditions.remove(instance.data.condition._id);
		popDialogStack();
	},
});