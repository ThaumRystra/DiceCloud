import { format as formatUrl } from 'url';

const CLIENT_ID = "zv38izfGZDf8s_Z9BI5kICjGGnvs45PawHYu6cqsTqftwZ_5DZFqEGKZfdP8Q6I2";

Template.profile.onCreated(function(){
	this.showApiKey = new ReactiveVar(false);
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
	patreonLoginUrl: function(){
		return formatUrl({
	    protocol: 'https',
	    host: 'patreon.com',
	    pathname: '/oauth2/authorize',
	    query: {
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: Meteor.absoluteUrl() + 'patreon-redirect',
        state: Meteor.userId(),
				scope: 'identity',
	    },
		});
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
		let tier = patreon.entitledCents || 0;
		if (patreon.entitledCentsOverride > tier) tier = patreon.entitledCentsOverride;
		return tier;
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
	"click .showApiKey": function(event, instance){
		instance.showApiKey.set(!instance.showApiKey.get());
	},
	"click .generateMyApiKey": function(event, instance){
		Meteor.call("generateMyApiKey");
		instance.showApiKey.set(true);
	},
});
