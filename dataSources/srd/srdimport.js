// Only do if the library doesn't exist yet
id = Libraries.insert({
	_id: "SRDLibraryGA3XWsd",
	owner: Meteor.userId(),
	name: "SRD Library",
});

_.each(items, (item) => {
	item.settings = {category: }; // "adventuringGear", "armor", "weapons", "tools"
	item.library = "SRDLibraryGA3XWsd"
	LibraryItems.insert(item)
});
