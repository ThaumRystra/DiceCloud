Template.characterSheet.onRendered(function() {
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
	hideSpellcasting: function() {
		var char = Characters.findOne(this._id);
		return char && char.settings.hideSpellcasting;
	},
});

Template.characterSheet.events({
	"iron-select #characterSheetTabs": function(event, instance){
		setTab(this._id, event.target.selected);
	},
	"color-change": function(event, instance){
		Characters.update(this._id, {$set: {color: event.color}});
	},
	"tap #deleteCharacter": function(event, instance){
		const menu = instance.find(".character-menu");
		pushDialogStack({
			data: this,
			template: "deleteCharacterConfirmation",
			element: event.currentTarget.parentElement.parentElement,
		});
	},
	"tap #shareCharacter": function(event, instance){
		const menu = instance.find(".character-menu");
		pushDialogStack({
			data: this,
			template: "shareDialog",
			element: event.currentTarget.parentElement.parentElement,
		});
	},
	"tap #characterSettings": function(event, instance){
		const menu = instance.find(".character-menu");
		pushDialogStack({
			data: this,
			template: "characterSettings",
			element: event.currentTarget.parentElement.parentElement,
		});
	},
});
