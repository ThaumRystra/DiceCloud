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

let drawerLayout;
const closeDrawer = function(instance){
	if (!drawerLayout) drawerLayout = instance.find("app-drawer-layout");
	if (drawerLayout && drawerLayout.narrow){
		drawerLayout.drawer.close();
	}
}

Template.layout.events({
	"tap #homeNav": function(event, instance){
		Router.go("/");
		closeDrawer(instance);
	},
	"tap #profileLink": function(event, instance){
		Router.go("profile");
		closeDrawer(instance);
	},
	"tap #feedback": function(event, instance) {
		GlobalUI.showDialog({
			heading: "Feedback",
			template: "feedback",
			fullOnMobile: true,
		});
		closeDrawer(instance);
	},
	"tap #changeLog": function(event, instance) {
		Router.go("changeLog");
		closeDrawer(instance);
	},
	"tap #guide": function(event, instance) {
		Router.go("guide");
		closeDrawer(instance);
	},
});
