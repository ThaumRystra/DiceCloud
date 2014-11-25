Template.characterSheet.created = function(){
	Template.instance().tab = new ReactiveVar("characterStats")
}

Template.characterSheet.helpers({
	getTab: function(){
		return Template.instance().tab.get();
	},
});

var setTab = function(value){
	Template.instance().tab.set(value);
}

Template.characterSheet.events({
	"click #statsTab": function(){
		setTab("stats");
	},
	"click #featuresTab": function(){
		setTab("features");
	},
	"click #personaTab": function(){
		setTab("persona");
	},
	"click #inventoryTab": function(){
		setTab("inventory");
	},
	"click #spellsTab": function(){
		setTab("spellbook");
	},
	"click #journalTab": function(){
		setTab("journal");
	},
})