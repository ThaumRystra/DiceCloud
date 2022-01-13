Template.layout.onCreated(function() {
	this.subscribe("user");
});

Template.layout.helpers({
  connectionStatus: function(){
    let status = Meteor.status()
    return status.reason || status.status;
  },
  disconnected: function(){
    return !Meteor.status().connected;
  },
});

Template.appDrawer.helpers({
	profileLink: function() {
		var user = Meteor.user();
		return user.profile && user.profile.username || user.username || "My Account";
	},
	showPatreonBadge: function(){
		let post = PatreonPosts.findOne({}, {sort: {date: -1}});
		let user = Meteor.user();
		if (!post || !user) return false;
		return post.link !== user.lastPatreonPostClicked;
	},
	patreonLink: function(){
		let post = PatreonPosts.findOne({}, {sort: {date: -1}});
		return (post && post.link) || 'https://www.patreon.com/dicecloud';
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
	"click .patreon": function(event, instance){
		let post = PatreonPosts.findOne({}, {sort: {date: -1}});
		let link = (post && post.link) || 'https://www.patreon.com/dicecloud';
		Meteor.call('clickPatreonPost', link);
		ga("send", "event", "externalLink", "patreon");
	},
	"click .github": function(event, instance){
		ga("send", "event", "externalLink", "github");
	},
});
