Template.profile.helpers({
	profileName: function() {
		var user = Meteor.user();
		return user.profile && user.profile.username ||
			user.username ||
			"Tap to set username";
	}
});

Template.profile.events({
	"click .username-edit": function(event, instance){
		if (this._id === Meteor.userId()){
			pushDialogStack({
				template: "usernameDialog",
				element: event.currentTarget,
			});
		}
	},
	"click #at-resend-verification-email": function(event, instance){
		if (!Meteor.user()) return;
		Accounts.sendVerificationEmail(Meteor.userId(), this.address);
		GlobalUI.toast({
			text: "Email verification sent to " + this.address,
			template: "",
			data: {},
		});
	},
});
