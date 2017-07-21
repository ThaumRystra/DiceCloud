// This all gets run in the console by an admin.
// Probably a good idea to reset the server after running big updates
// Only do if the library doesn't exist yet
id = Libraries.insert({
	_id: "SRDLibraryGA3XWsd",
	owner: Meteor.userId(),
	name: "SRD Library",
});

// First copy-paste the JSON into your console like `items = <pasted JSON>`
// First import, don't do this if the library is already populated
_.each(items, (item) => {
	item.settings = {category: }; // "adventuringGear", "armor", "weapons", "tools"
	item.library = "SRDLibraryGA3XWsd"
	LibraryItems.insert(item)
});

_.each(spells, (spell) => {
	spell.library = "SRDLibraryGA3XWsd"
	LibrarySpells.insert(spell)
});

// Update the library using names as keys
// Make sure you're subscribed to all item categories
handles = _.map(["weapons", "armor", "adventuringGear", "tools"],
	category => Meteor.subscribe("standardLibraryItems", category)
);
// Wait until all the handles are ready
handles.map(h => h.ready()); // must reaturn [...true]

_.each(items, (item) => {
	var existingItem = LibraryItems.findOne({
		library: "SRDLibraryGA3XWsd",
		name: item.name,
	});
	if (!existingItem) return;
	_.each(item.attacks, attack => Schemas.LibraryAttacks.clean(attack));
	LibraryItems.update(existingItem._id, {$set: item});
});

// Make sure you're subscribed to all spell categories
handles = _.map([0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	category => Meteor.subscribe("standardLibrarySpells", category)
);
// Wait until all the handles are ready
handles.map(h => h.ready()); // must reaturn [...true]

_.each(spells, (spell) => {
	var existingSpell = LibrarySpells.findOne({
		library: "SRDLibraryGA3XWsd",
		name: spell.name,
	});
	if (!existingSpell) return;
	_.each(spell.attacks, attack => Schemas.LibraryAttacks.clean(attack));
	LibrarySpells.update(existingSpell._id, {$set: spell});
});
