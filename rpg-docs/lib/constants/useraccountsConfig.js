AccountsTemplates.configure({
	//behaviour
	sendVerificationEmail: true,
	//appearance
	continuousValidation: true,
	negativeValidation: true,
	negativeFeedback: true,
	showValidating: true,
	showAddRemoveServices: true,
});

AccountsTemplates.configureRoute("enrollAccount");
AccountsTemplates.configureRoute("forgotPwd");
AccountsTemplates.configureRoute("resetPwd");
AccountsTemplates.configureRoute("signIn");
AccountsTemplates.configureRoute("signUp");
AccountsTemplates.configureRoute("verifyEmail");
AccountsTemplates.configureRoute("resendVerificationEmail");

if (Meteor.isServer){
	Meteor.methods({
		"userExists": function(username){
			return !!Meteor.users.findOne({username: username});
		},
	});
}

AccountsTemplates.addField({
	_id: "username",
	type: "text",
	required: true,
	func: function(value){
		if (Meteor.isClient) {
			var self = this;
			Meteor.call("userExists", value, function(err, userExists){
				if (!userExists)
					self.setSuccess();
				else
					self.setError("This username is taken");
				self.setValidating(false);
			});
			return;
		}
		// Server
		return Meteor.call("userExists", value);
	},
});
