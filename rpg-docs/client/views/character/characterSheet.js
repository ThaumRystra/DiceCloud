Template.characterSheet.created = function(){
	Template.instance().selectedTab = new ReactiveVar(0)
}

Template.characterSheet.rendered = function(){
	var observer = new ObjectObserver(document.querySelector('#characterSheetTabs'));
	var instance = Template.instance();
	observer.open(function(added, removed, changed, getOldValueFn) {
		Object.keys(changed).forEach(function(property) {
			if(property === "selected"){
				var selected = changed[property];
				instance.selectedTab.set(selected);
			}
		})
	});
}

Template.characterSheet.helpers({
	selectedTab: function(){
		return Template.instance().selectedTab.get();
	},
});

Template.characterSheet.events({
	
})

/* requires the following templates
stats
features
persona
inventory
spellbook
journal
*/