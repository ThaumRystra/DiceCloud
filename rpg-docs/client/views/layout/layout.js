Template.layout.rendered = function() {
	$(window).on('popstate', GlobalUI.popStateHandler);
};

Template.layout.destroyed = function() {
	$(window).off('popstate', GlobalUI.popStateHandler);
};

Template.layout.helpers({
	notSelected: function(){
		return Session.get("global.ui.detailShow")? "not-selected" : null;
	}
});

Template.layout.events({
	"tap #charactersMenuButton": function(event, instance){
		Router.go("/");
	}
});
