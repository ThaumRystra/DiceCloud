Meteor.publish("standardLibraries", function(){
	const standardLibraryIds = [
		"SRDLibraryGA3XWsd",
	];
	return [
		LibraryItems.find({library: {$in: standardLibraryIds}}),
		Libraries.find({_id: {$in: standardLibraryIds}}),
	];
});
