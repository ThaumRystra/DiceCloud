Meteor.publish("standardLibraries", function(){
	return Items.find({charId: {$in: [
		"SRDLibrary",
	]}});
});
