Template.characterSheet.created = function(){
	Template.instance().selectedTab = new ReactiveVar(0)
};

var setTab = function(instance, num){
	instance.selectedTab.set(num);
};

var incTab = function(instance, num){
	var current = +instance.selectedTab.get();
	var selected = current + num;
	if (selected < 0) return;
	if (selected >= document.querySelector('#tabPages').children.length) return;
	setTab(instance, selected);
};

Template.characterSheet.rendered = function(){
	var observer = new ObjectObserver(document.querySelector('#characterSheetTabs'));
	var instance = Template.instance();
	observer.open(function(added, removed, changed, getOldValueFn) {
		Object.keys(changed).forEach(function(property) {
			if(property === "selected"){
				var selected = changed[property];
				setTab(instance, selected);
			}
		})
	});
};

Template.characterSheet.helpers({
	selectedTab: function(){
		return Template.instance().selectedTab.get();
	}
});

Template.characterSheet.events({
	"#tabPages track": function(event){
		console.log(event);
	},
	"swipeleft": function(event){
		incTab(Template.instance(), 1);
	},
	"swiperight": function(event){
		incTab(Template.instance(), -1);
	},
	"core-animated-pages-transition-end #tabPages": function(event) {
		event.stopPropagation();
	}
});

/* requires the following templates
stats
features
persona
inventory
spellbook
journal
*/