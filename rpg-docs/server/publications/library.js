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

Meteor.publish("standardLibraryEquipmentPacks", function(){
	return LibraryEquipmentPacks.find({
		library: {$in: standardLibraryIds}
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
