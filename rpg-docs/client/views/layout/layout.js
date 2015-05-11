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
	},
	"tap #profileLink": function(event, instance){
		Router.go("profile");
	},
});
