AccountsTemplates.configure({
	//behaviour
	confirmPassword: true,
	enablePasswordChange: true,
	enforceEmailVerification: true,
	overrideLoginErrors: false,
	sendVerificationEmail: true,
	lowercaseUsername: true,
	//appearance
	continuousValidation: true,
	negativeValidation: true,
	negativeFeedback: true,
	showValidating: true,
	showAddRemoveServices: true,
	showForgotPasswordLink: true,
	showResendVerificationEmailLink: true,
});

AccountsTemplates.configureRoute("changePwd", {
	template: "titledAtForm",
});
AccountsTemplates.configureRoute("enrollAccount", {
	template: "titledAtForm",
});
AccountsTemplates.configureRoute("forgotPwd", {
	template: "titledAtForm",
});
AccountsTemplates.configureRoute("resetPwd", {
	template: "titledAtForm",
});
AccountsTemplates.configureRoute("signIn", {
	template: "titledAtForm",
});
AccountsTemplates.configureRoute("signUp", {
	template: "titledAtForm",
});
AccountsTemplates.configureRoute("verifyEmail", {
	template: "titledAtForm",
});
AccountsTemplates.configureRoute("resendVerificationEmail", {
	template: "titledAtForm",
});

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
