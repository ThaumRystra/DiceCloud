Template.characterSheet.onCreated(function() {
	//default to the first tab
	Session.setDefault(this.data._id + ".selectedTab", "stats");
	//watch this character and make sure their encumbrance is updated
	trackEncumbranceConditions(this.data._id, this);
});

var setTab = function(charId, tab){
	return Session.set(charId + ".selectedTab", tab);
};

var getTab = function(charId){
	return Session.get(charId + ".selectedTab");
};

Template.characterSheet.helpers({
	selectedTab: function(){
		return getTab(this._id);
	},
});

Template.characterSheet.events({
	"core-animated-pages-transition-end #tabPages": function(event) {
		event.stopPropagation();
	},
	"tap #characterSheetTabs paper-tab": function(event, instance){
		setTab(this._id, event.currentTarget.getAttribute("name"));
	},
	"color-change": function(event, instance){
		Characters.update(this._id, {$set: {color: event.color}});
	},
	"tap #deleteCharacter": function(event, instance){
		GlobalUI.showDialog({
			heading: "Delete " + this.name,
			data: this,
			template: "deleteCharacterConfirmation",
		});
	},
	"tap #shareCharacter": function(event, instance){
		GlobalUI.showDialog({
			heading: "Share " + this.name,
			data: this,
			template: "shareDialog",
		});
	},
	"tap #characterSettings": function(event, instance){
		GlobalUI.showDialog({
			heading: this.name + " Settings",
			data: this,
			template: "characterSettings",
		});
	},
});
