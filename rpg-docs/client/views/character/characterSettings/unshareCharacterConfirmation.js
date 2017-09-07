Template.unshareCharacterConfirmation.onCreated(function() {
	this.canUnshare = new ReactiveVar(false);
});

Template.unshareCharacterConfirmation.helpers({
	cantUnshare: function() {
		return !Template.instance().canUnshare.get();
	},
	getStyle: function() {
		if (Template.instance().canUnshare.get()) {
			return "background: #d23f31; color: white;";
		}
	}
});

Template.unshareCharacterConfirmation.events({
	"change #nameInput, input #nameInput": function(event, instance) {
		var can = instance.find("#nameInput").value === this.name;
		instance.canUnshare.set(can);
	},
	"click #unshareButton": function(event, instance) {
		if (instance.find("#nameInput").value === this.name) {
			setTimeout(popDialogStack, 100); //weird things happen without the delay.
			Router.go("/characterList");
			Meteor.call("removeMeFromReaders", this._id);
		}
	},
	"click .cancelButton": function(event, instance){
		popDialogStack();
	},
});
