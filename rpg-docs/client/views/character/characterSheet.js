Template.characterSheet.created = function(){
	Session.setDefault(this.data._id + ".selectedTab", "stats");
}

var setTab = function(charId, tab){
	return Session.set(charId + ".selectedTab", tab);
};

var getTab = function(charId){
	return Session.get(charId + ".selectedTab");
};

Template.characterSheet.helpers({
	selectedTab: function(){
		return getTab(this._id);
	}
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
});
