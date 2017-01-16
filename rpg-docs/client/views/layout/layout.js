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
	"click app-drawer a": function(event, instance){
		closeDrawer(instance);
	},
	"click #feedback": function(event, instance) {
		pushDialogStack({
			template: "feedback",
			element: event.currentTarget,
			callback: function(report){
				if (!report) return;
				Meteor.call("insertReport", report, function(e, result){
					GlobalUI.toast({
						text: e && e.details || "Feedback submitted"
					});
				});
			},
		});
		closeDrawer(instance);
	},
});
