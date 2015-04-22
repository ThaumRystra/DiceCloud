Template.profile.events({
	"tap #username": function(){
		if (this._id === Meteor.userId()){
			GlobalUI.showDialog({
				heading: "Change Username",
				template: "usernameDialog",
			});
		}
	},
	"tap #verifyEmail": function(event, instance){
		if (!Meteor.user()) return;
		Accounts.sendVerificationEmail(Meteor.userId(), this.address);
		GlobalUI.toast({
			text: "Email verification sent to " + this.address,
			template: "",
			data: {},
		});
	},
});
