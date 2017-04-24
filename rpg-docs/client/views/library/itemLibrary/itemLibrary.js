Template.itemLibrary.helpers({
	items(){
		return Items.find({charId: {$in: [
			"SRDLibrary",
		]}});
	},
});
