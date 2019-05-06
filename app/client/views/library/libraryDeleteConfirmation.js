Template.libraryDeleteConfirmation.events({
	"click #deleteButton": function(event, instance) {
		popDialogStack(true);
	},
	"click .cancelButton": function(event, instance){
		popDialogStack();
	},
});
