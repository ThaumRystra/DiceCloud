const librarySubs = new SubsManager();

Template.itemLibrary.onCreated(function(){
  this.selectedTab = new ReactiveVar("0");
  this.librariesOpen = new ReactiveVar([]);
  this.readyDict = new ReactiveDict();
  this.autorun(() => {
    // Subscribe to all open libraries
    _.each(this.librariesOpen.get(), (libraryId) => {
      var handle = librarySubs.subscribe("libraryItems", libraryId);
      this.autorun(() => {
        this.readyDict.set(libraryId, handle.ready());
      });
    });
  });
});

Template.itemLibrary.helpers({
  selectedTab(){
    return Template.instance().selectedTab.get();
  },
  libraries(){
    let userId = Meteor.userId();
    return Libraries.find({
      $or: [
  			{readers: userId},
  			{writers: userId},
  			{owner: userId},
  		],
    });
  },
  libraryItems(){
    return LibraryItems.find({
      library: this._id
    },{
      sort: {name: 1}
    });
  },
  ready(libraryId){
    return Template.instance().readyDict.get(libraryId);
  },
  isOpen(libraryId){
		const librariesOpen = Template.instance().librariesOpen.get();
		return _.contains(librariesOpen, libraryId);
	},
});

Template.itemLibrary.events({
  "click .library-header": function(event, template){
		let libs = template.librariesOpen.get();
		const libraryId = this._id;
		// Toggle whether this key is in the array or not
		if (_.contains(libs, libraryId)){
			libs = _.without(libs, libraryId);
		} else {
			libs.push(libraryId);
		}
		template.librariesOpen.set(libs);
	},
  "click .editLibrary": function(event, instance){
    event.stopPropagation();
		var libraryId = this._id;
		pushDialogStack({
			template: "libraryDialog",
			data:     {libraryId},
			element: event.currentTarget.parentElement.parentElement,
			returnElement: () => instance.find(`.library-header[data-id='${libraryId}']`),
		});
	},
  "click .addItem": function(event, instance){
    event.stopPropagation();
		var libraryId = this._id;
    var itemId = LibraryItems.insert({
			name: "New Library Item",
			library: libraryId,
		});
		pushDialogStack({
			template: "libraryItemDialog",
			data:     {itemId},
			element: event.currentTarget,
			returnElement: () => instance.find(`.item-name[data-id='${itemId}']`),
		});
	},
  "click .item-name": function(event, instance){
    event.stopPropagation();
		var itemId = this._id;
		pushDialogStack({
			template: "libraryItemDialog",
			data:     {itemId},
			element: event.currentTarget,
			returnElement: () => instance.find(`.item-name[data-id='${itemId}']`),
		});
	},
})
