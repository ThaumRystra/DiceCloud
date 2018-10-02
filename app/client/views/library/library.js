const librarySubs = new SubsManager();

Template.library.onCreated(function(){
  this.selectedTab = new ReactiveVar("0");
});

Template.library.helpers({
  selectedTab(){
    return Template.instance().selectedTab.get();
  },
});

Template.library.events({
  "iron-select #libraryTabs": function(event, instance){
		instance.selectedTab.set(event.target.selected);
	},
  "click #addLibrary": function(event, instance){
		var libraryId = Libraries.insert({
			name: "New Library",
			owner: Meteor.userId(),
		});
		pushDialogStack({
			template: "libraryDialog",
			data:     {libraryId},
			element: event.currentTarget,
			returnElement: () => instance.find(`.library-header[data-id='${libraryId}']`),
		});
	},
})
