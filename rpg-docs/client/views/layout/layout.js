Template.layout.onCreated(function() {
	this.subscribe("user");
});

Template.layout.rendered = function() {
	$(window).on("popstate", GlobalUI.popStateHandler);
};

Template.layout.destroyed = function() {
	$(window).off("popstate", GlobalUI.popStateHandler);
};

Template.layout.helpers({
	notSelected: function(){
		return Session.get("global.ui.detailShow") ? "not-selected" : null;
	},
	profileLink: function() {
		var user = Meteor.user();
		return user.profile && user.profile.username || user.username || "My Account";
	},
});

Template.layout.events({
	"tap #homeNav": function(event, instance){
		Router.go("/");
		instance.find("core-drawer-panel").closeDrawer();
	},
	"tap #profileLink": function(event, instance){
		Router.go("profile");
		instance.find("core-drawer-panel").closeDrawer();
	},
	"tap #feedback": function(event, instance) {
		GlobalUI.showDialog({
			heading: "Feedback",
			template: "feedback",
			fullOnMobile: true,
		});
		instance.find("core-drawer-panel").closeDrawer();
	},
	"tap #changeLog": function(event, instance) {
		Router.go("changeLog");
		instance.find("core-drawer-panel").closeDrawer();
	},
});
