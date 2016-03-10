Template.iconDropdown.onCreated(function(){
	this.search = new ReactiveVar();
});

Template.iconDropdown.helpers({
	rpgIconNames: function() {
		var searchString = Template.instance().search.get();
		if (!searchString || searchString.length < 3) return;
		searchString = searchString.toLowerCase();
		if (searchString){
			return _.filter(rpgIconNames, function(name){
				return name.indexOf(searchString) != -1
			});
		}
	},
	selectedIcon: function(){
		var selected = this.icon;
		if (selected){
			return "rpg:" + selected;
		} else {
			return "add";
		}
	},
	search: function(){
		return Template.instance().search.get();
	},
	noResults: function(numResults){
		var searchString = Template.instance().search.get();
		return searchString && searchString.length >= 3 && !numResults;
	},
});

Template.iconDropdown.events({
	"input .icon-search-input": _.debounce(function(event, template){
		var val = event.target.value;
		template.search.set(val);
	}, 200),
	"click .icon-in-list": function(event, template){
		template.find("paper-dropdown").close();
		var event = new CustomEvent("icon-selected", {
			 detail: this.toString(),
		});
		template.find(".icon-dropdown").dispatchEvent(event);
	},
	"click .clear-button": function(event, template){
		template.find("paper-dropdown").close();
		var event = new CustomEvent("icon-selected", {
			 detail: "",
		});
		template.find(".icon-dropdown").dispatchEvent(event);
	},
	"core-overlay-close-completed .dropdown": function(event, template){
		template.search.set();
	}
});
