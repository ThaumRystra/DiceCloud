Template.profile.onCreated(function(){
	this.showApiKey = new ReactiveVar(false);
	this.loadingPatreon = new ReactiveVar(false);
});

Template.profile.helpers({
	profileName: function() {
		var user = Meteor.user();
		return user.profile && user.profile.username ||
			user.username ||
			"Tap to set username";
	},
	showApiKey: function(){
		return Template.instance().showApiKey.get();
	},
	patreon: function(){
		let user = Meteor.user();
		return user && user.patreon || {};
	},
	tier: function(){
		let user = Meteor.user();
		if (!user) return;
		patreon = user.patreon;
		if (!patreon) return;
		let entitledCents = patreon.entitledCents || 0;
		if (Template.instance().loadingPatreon.get()){
			return "loading..."
		} else if (patreon.entitledCentsOverride > entitledCents){
			return `$ ${(patreon.entitledCentsOverride / 100).toFixed(0)} (overridden)`;
		} else if (patreon.entitledCents === undefined){
			return "?";
		} else {
			return "$" + (patreon.entitledCents / 100).toFixed(0);
		}
	},
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
	"click .showApiKey": function(event, instance){
		instance.showApiKey.set(!instance.showApiKey.get());
	},
	"click .generateMyApiKey": function(event, instance){
		Meteor.call("generateMyApiKey");
		instance.showApiKey.set(true);
	},
	"click .refreshPatreon": function(event, instance){
		instance.loadingPatreon.set(true);
		Meteor.call("updateMyPatreonDetails", (error) => {
			instance.loadingPatreon.set(false);
		});
	},
});
