var getUsername = function() {
	var user = Meteor.user();
	return user.profile && user.profile.username || user.username;
};

Template.usernameDialog.onCreated(function() {
	this.errorMessage = new ReactiveVar();
	this.username = new ReactiveVar(getUsername());
});

Template.usernameDialog.helpers({
	profileName: function() {
		return getUsername();
	},
	invalid: function() {
		return !!Template.instance().errorMessage.get();
	},
	errorMessage: function() {
		return Template.instance().errorMessage.get();
	},
});

Template.usernameDialog.events({
	"change #usernameInput, input #usernameInput": function(event, instance) {
		var username = instance.find("#usernameInput").value;
		username = username.trim().toLowerCase().replace(/\s+/gm, "");
		if (username.length < 3){
			instance.errorMessage.set("Username too short");
		} else {
			instance.errorMessage.set("Validating...");
			Meteor.call("getUserId", username, function(err, userId){
				if (userId && userId !== Meteor.userId())
					instance.errorMessage.set("This username is taken");
				else
					instance.errorMessage.set();
			});
		}
	},
	"click #changeButton": function(event, instance){
		var username = instance.find("#usernameInput").value;
		popDialogStack();
		username = username.trim().replace(/\s+/gm, " ");
		var profileName = username;
		username = username.toLowerCase().replace(/\s+/gm, "");
		Meteor.users.update(
			Meteor.userId(),
			{$set: {username: username, "profile.username": profileName}}
		);
	},
	"click #cancelButton": function(event, instance){
		popDialogStack();
	},
});
