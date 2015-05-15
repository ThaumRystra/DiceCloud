Template.fabMenu.onCreated(function() {
	this.active = new ReactiveVar(false);
});

Template.fabMenu.helpers({
	active: function() {
		return Template.instance().active.get();
	},
});

Template.fabMenu.events({
	"tap .expand-menu": function(event, instance) {
		instance.active.set(!instance.active.get());
	},
});