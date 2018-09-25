Meteor.startup(() => {
	const collections = [
		Attacks, Buffs, Classes, CustomBuffs, Effects, Experiences,
		Features, Notes, Proficiencies, SpellLists, Spells,
		Containers, Items,
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
			collection.remove({
				removed: true,
				removedAt: {$lt: thirtyMinutesAgo} // dates *before* 30 minutes ago
			}, function(error, result){
				if (error){
					console.error(error);
				}
			});
		});
	};

	SyncedCron.add({
		name: "deleteSoftRemovedDocs",
		schedule: function(parser) {
			return parser.text('every 2 hours');
		},
		job: deleteOldSoftRemovedDocs,
	});

	SyncedCron.start();

	// Add a method to manually trigger removal
	Meteor.methods({
		deleteOldSoftRemovedDocs() {
			const user = Meteor.users.findOne(this.userId);
			if (user && _.contains(user.roles, "admin")){
				this.unblock();
				return deleteOldSoftRemovedDocs();
			}
		},
	});
});
