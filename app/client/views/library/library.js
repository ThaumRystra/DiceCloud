const librarySubs = new SubsManager();

Template.library.onCreated(function(){
  this.searchTerm = new ReactiveVar("");
});

Template.library.helpers({
  items(){
    let search = Template.instance().searchTerm.get();
    if (search){
      return LibraryItems.find(
        {
          library: this._id,
          $or: [
            {
              name: {$regex: new RegExp(".*" + search + ".*", "gi")}
            },
            {
              libraryname: {$regex: new RegExp(".*" + search + ".*", "gi")}
            },
          ],
        },
        {sort: {name: 1}},
      );
    } else {
      return LibraryItems.find(
        {library: this._id},
        {sort: {name: 1}},
      );
    }
  },
  displayName(){
    return this.libraryName || this.name;
  },
  canUserSubscribe(){
    let user = Meteor.user();
    let userId = user._id;
    return !(
      _.contains(this.readers, userId) ||
      _.contains(this.writers, userId) ||
      this.owner === userId ||
      _.contains(user.profile.librarySubscriptions, this._id)
    );
  },
  canUserUnsubscribe(){
    let user = Meteor.user();
    let userId = user._id;
    return (
      _.contains(user.profile.librarySubscriptions, this._id) ||
      _.contains(this.readers, userId)
    );
  },
  canUserEdit(){
    let userId = Meteor.userId();
    return (
      _.contains(this.writers, userId) ||
      this.owner === userId
    );
  },
});

Template.library.events({
  "input .search-input, change .search-input": function(event, template){
		const value = event.currentTarget.value;
		template.searchTerm.set(value);
	},
  "click #edit": function(event, instance){
    event.stopPropagation();
		var libraryId = this._id;
		pushDialogStack({
			template: "libraryDialog",
			data:     {libraryId},
			element: event.currentTarget.parentElement.parentElement,
      callback(data){
        if (data && data.delete){
          Router.go('/library');
          Tracker.afterFlush(function(){
            Libraries.remove(libraryId);
          });
        }
      },
		});
	},
  "click #addLibraryItem": function(event, instance){
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
			returnElement: () => instance.find(`.item[data-id='${itemId}']`),
		});
	},
  "click .item": function(event, instance){
    event.stopPropagation();
		var itemId = this._id;
		pushDialogStack({
			template: "libraryItemDialog",
			data:     {itemId},
			element: event.currentTarget,
			returnElement: () => instance.find(`.item[data-id='${itemId}']`),
		});
	},
  "click #subscribe": function(event, instance){
    Meteor.users.update(Meteor.userId(), {
      $addToSet: {"profile.librarySubscriptions": this._id},
    });
  },
  "click #unsubscribe": function(event, instance){
    let userId = Meteor.userId();
    Meteor.users.update(userId, {
      $pull: {"profile.librarySubscriptions": this._id},
    });
    Meteor.call("unshareLibraryWithMe", this._id);
  },
});
