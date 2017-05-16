Template.fabMenu.onCreated(function() {
	this.active = new ReactiveVar(false);
});

Template.fabMenu.onRendered(function(){
	const fab = this.find("paper-fab.expand-menu");
	// Do a spin animation to turn the + icon into a x when active
	this.autorun(() => {
		const active = this.active.get();
		if (fab && fab.updateStyles){
			const iconStyle = active ?
				"transition: transform 0.3s ease; transform: rotate(225deg);" :
				"transition: transform 0.3s ease;";
			fab.updateStyles({
				["--paper-fab-iron-icon"]: iconStyle,
			});
		}
	})
});

Template.fabMenu.helpers({
	active: function() {
		return Template.instance().active.get();
	},
});

Template.fabMenu.events({
	"click .expand-menu": function(event, instance) {
		instance.active.set(!instance.active.get());
	},
	"click .mini-holder paper-fab": function(event, instance) {
		instance.active.set(false);
	},
});
