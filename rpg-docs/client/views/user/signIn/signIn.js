Template.signIn.events({
	"tap #signInButton": function(event, instance){
		var email = instance.find("#emailInput").value;
		var pass = instance.find("#passwordInput").value;
		Meteor.loginWithPassword(email, pass);
	},
	"keypress #emailInput, keypress #passwordInput": function(event, instance) {
		if (event.which === 13) {
			var email = instance.find("#emailInput").value;
			var pass = instance.find("#passwordInput").value;
			Meteor.loginWithPassword(email, pass);
		}
	},
	"tap #signOutButton": function(event, instance){
		Meteor.logout();
	},
	"tap #createAccountButton": function(event, instance){
		console.warn("not yet implemented");
		//Session.set("creatingNewUser", true);
	},
});
