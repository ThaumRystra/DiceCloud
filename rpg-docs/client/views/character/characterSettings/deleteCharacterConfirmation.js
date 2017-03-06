Template.deleteCharacterConfirmation.onCreated(function() {
	this.canDelete = new ReactiveVar(false);
});

Template.deleteCharacterConfirmation.helpers({
	cantDelete: function() {
		return !Template.instance().canDelete.get();
	},
	getStyle: function() {
		if (Template.instance().canDelete.get()) {
			return "background: #d23f31; color: white;";
		}
	}
});

Template.deleteCharacterConfirmation.events({
	"change #nameInput, input #nameInput": function(event, instance) {
		var canDel = instance.find("#nameInput").value === this.name;
		instance.canDelete.set(canDel);
	},
	"click #deleteButton": function(event, instance) {
		if (instance.find("#nameInput").value === this.name) {
			popDialogStack();
			Router.go("/characterList");
			Characters.remove(this._id);
		}
	},
	"click .cancelButton": function(event, instance){
		popDialogStack();
	},
});
