Template.layout.onCreated(function() {
	this.subscribe("user");
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
	patreonTier: function(){
		let user = Meteor.user();
		if (!user) return;
		patreon = user.patreon;
		if (!patreon) return "free";
		let entitledCents = patreon.entitledCents || 0;
		if (patreon.entitledCentsOverride > entitledCents){
			return "$" + (patreon.entitledCentsOverride / 100).toFixed(0);
		} else if (!patreon.entitledCents){
			return "free";
		} else {
			return "$" + (patreon.entitledCents / 100).toFixed(0);
		}
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
