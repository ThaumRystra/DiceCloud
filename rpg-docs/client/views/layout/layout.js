Template.layout.onCreated(function() {
	this.subscribe("user");
});

Template.appDrawer.helpers({
	profileLink: function() {
		var user = Meteor.user();
		return user.profile && user.profile.username || user.username || "My Account";
	},
});

let drawerLayout;
const closeDrawer = function(instance){
	if (!drawerLayout) drawerLayout = $("app-drawer-layout")[0];
	if (drawerLayout && drawerLayout.narrow){
		drawerLayout.drawer.close();
	}
}

Template.appDrawer.events({
	"click a": function(event, instance){
		closeDrawer(instance);
	},
	"click .feedback": function(event, instance) {
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
