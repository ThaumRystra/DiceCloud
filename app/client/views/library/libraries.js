const librarySubs = new SubsManager();

Template.libraries.helpers({
  libraries(){
    let userId = Meteor.userId();
    let subs = Meteor.user() && Meteor.user().profile.librarySubscriptions;
    return Libraries.find({
      $or: [
  			{readers: userId},
  			{writers: userId},
  			{owner: userId},
        {_id: {$in: subs || []}}
  		],
    }, {
      sort: {name: 1},
    });
  },
});

Template.libraries.events({
  "click #addLibrary": function(event, instance){
		var libraryId = Libraries.insert({
			name: "New Library",
			owner: Meteor.userId(),
		});
		pushDialogStack({
			template: "libraryDialog",
			data:     {libraryId},
			element: event.currentTarget,
			returnElement: () => instance.find(`.library[data-id='${libraryId}']`),
      callback(data){
        if (data && data.delete){
          Libraries.remove(libraryId);
        }
      }
		});
	},
})
