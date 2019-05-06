Libraries = new Mongo.Collection("library");

Schemas.Library = new SimpleSchema({
	name:    {type: String},
	owner:   {type: String, regEx: SimpleSchema.RegEx.Id, index: 1},
	readers: {type: [String], regEx: SimpleSchema.RegEx.Id, defaultValue: [], index: 1},
	writers: {type: [String], regEx: SimpleSchema.RegEx.Id, defaultValue: [], index: 1},
	public:  {type: Boolean, defaultValue: false, index: 1},
});

Libraries.attachSchema(Schemas.Library);

if (Meteor.isServer){
	Libraries.after.remove(function(userId, library) {
		LibraryItems.remove({library: library._id});
		LibrarySpells.remove({library: library._id});
	});
}

Meteor.methods({
	unshareLibraryWithMe: function(libraryId) {
		let library = Libraries.findOne(libraryId);
		let userId = Meteor.userId();

		if (!library) return;
		if (library.owner === userId){
			throw new Meteor.error("Can't unshare, you own this")
		} else {
			if (_.contains(library.readers, userId)){
				Libraries.update(libraryId, {$pull: {"readers": userId}});
			}
			if (_.contains(library.writers, userId)){
				Libraries.update(libraryId, {$pull: {"writers": userId}});
			}
		}
	},
});

Libraries.allow({
	insert(userId, doc) {
		return userId && doc.owner === userId;
	},
	update(userId, doc, fields, modifier) {
		return canEdit(userId, doc);
	},
	remove(userId, doc) {
		return userId && doc.owner === userId;
	},
	fetch: ["owner", "writers"],
});

Libraries.deny({
	insert(userId, doc){
		return !Meteor.users.findOne(userId);
	},
	update(userId, doc, fields, modifier) {
		// Can't change owners
		return _.contains(fields, "owner")
	},
	fetch: [],
});

const canEdit = function(userId, library){
	if (!userId || !library) return;
	return library.owner === userId || _.contains(library.writers, userId);
};

Libraries.canEdit = function(userId, libraryId){
	const library = Libraries.findOne(libraryId);
	return canEdit(userId, library);
};
