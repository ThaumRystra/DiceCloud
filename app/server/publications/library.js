const standardLibraryIds = [
	"SRDLibraryGA3XWsd",
];

Meteor.publish("standardLibraries", function(){
	return Libraries.find({_id: {$in: standardLibraryIds}});
});

Meteor.publish("standardLibraryItems", function(categoryKey){
	return LibraryItems.find({
		library: {$in: standardLibraryIds},
		"settings.category": categoryKey,
	}, {
		sort: {name: 1},
	});
});

Meteor.publish("standardLibrarySpells", function(level){
	return LibrarySpells.find({
		library: {$in: standardLibraryIds},
		level,
	}, {
		sort: {name: 1},
	});
});

Meteor.publish("customLibraries", function(){
	const userId = this.userId;
	let user = Meteor.user()
	let subs = user && user.profile && user.profile.librarySubscriptions;
	return Libraries.find({
		$or: [
			{readers: userId},
			{writers: userId},
			{owner: userId},
			{public: true, _id: {$in: subs || []}},
		],
	});
});

Meteor.publish("singleLibrary", function(id){
	const userId = this.userId;
	return Libraries.find({
		_id: id,
		$or: [
			{readers: userId},
			{writers: userId},
			{owner: userId},
			{public: true},
		],
	});
});

Meteor.publish("libraryItems", function(libraryId){
	return LibraryItems.find({
		library: libraryId
	}, {
		fields: {
			name: 1,
			libraryName: 1,
			library: 1,
		},
	});
});

Meteor.publish("fullLibraryItems", function(libraryId){
	return LibraryItems.find({
		library: libraryId
	});
});

Meteor.publish("libraryItem", function(itemId){
	let cursor = LibraryItems.find(itemId);
	let item = cursor.fetch()[0];
	let userId = Meteor.userId();
	if (!item) return [];
	let library = Libraries.findOne(item.library);
	if (!library) {
		throw new Meteor.Error("Library item " + item._id + " is an orphan");
	}
	if (
		library.public ||
		library.owner === userId ||
		_.contains(library.readers, userId) ||
		_.contains(library.writers, userId)
	) {
		return cursor;
	} else {
		return [];
	}
});
