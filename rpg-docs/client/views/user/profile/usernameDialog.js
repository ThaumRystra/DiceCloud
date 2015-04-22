Template.usernameDialog.events({
	"tap #changeButton": function(event, instance){
		Meteor.users.update(
			Meteor.userId(),
			{$set: {username: instance.find("#usernameInput").value}}
		);
	}
});
