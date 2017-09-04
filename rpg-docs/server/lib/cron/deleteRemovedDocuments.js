Meteor.startup(() => {
	const collections = [
		Attacks,
		Buffs,
		Classes,
		Conditions,
		Effects,
		Experiences,
		Features,
		Notes,
		Proficiencies,
		SpellLists,
		Spells,

		Containers,
		Items,
	];

	/**
	 * Deletes all soft removed documents that were removed more than 30 minutes ago
	 * and were not restored
	 * @return {Number} Number of documents removed
	 */
	const deleteOldSoftRemovedDocs = function(){
		let numRemoved = 0;
		const now = new Date();
		const thirtyMinutesAgo = new Date(now.getTime() - 30*60000);
		_.each(collections, (collection) => {
			numRemoved += collection.remove({
				removed: true,
				removedAt: {$lt: thirtyMinutesAgo} // dates *before* 30 minutes ago
			});
		});
		return numRemoved;
	};

	SyncedCron.add({
		name: "Delete all soft removed items that haven't been restored",
		schedule: function(parser) {
			return parser.text('every 6 hours');
		},
		job: function() {
			deleteOldSoftRemovedDocs();
		}
	});

	// Add a method to manually trigger removal
	Meteor.methods({
		deleteOldSoftRemovedDocs() {
			const user = Meteor.users.findOne(this.userId);
			if (user && _.contains(user.roles, "admin")){
				return deleteOldSoftRemovedDocs();
			}
		},
	});
});
