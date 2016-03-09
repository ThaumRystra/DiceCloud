Template.iconList.onCreated(function(){
	this.selected = new ReactiveVar();
});

Template.iconList.helpers({
	selected: function(){
		return Template.instance().selected.get();
	},
});

Template.iconList.events({
	"icon-selected": function(event, template){
		var val = event.originalEvent.detail;
		template.selected.set(val);
	},
});
