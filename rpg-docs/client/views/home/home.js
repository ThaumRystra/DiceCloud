Template.home.helpers({
	selectedTab: function(){
		return Session.get("homePage.selectedTab");
	},
});

Template.home.events({
	"core-animated-pages-transition-end .tabPages": function(event) {
		event.stopPropagation();
	},
	"tap .homeTabs paper-tab": function(event, instance){
		Session.set("homePage.selectedTab",
					event.currentTarget.getAttribute("name"));
	},
});
