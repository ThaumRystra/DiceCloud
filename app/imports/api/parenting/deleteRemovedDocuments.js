import creatureCollections from '/imports/api/creature/creatureCollections.js';

if (Meteor.isServer) Meteor.startup(() => {
	/**
	 * Deletes all soft removed documents that were removed more than 30 minutes ago
	 * and were not restored
	 */
	const deleteOldSoftRemovedDocs = function(){
		const now = new Date();
		const thirtyMinutesAgo = new Date(now.getTime() - 30*60000);
		creatureCollections.forEach(collection => {
			collection.remove({
				removed: true,
				removedAt: {$lt: thirtyMinutesAgo} // dates *before* 30 minutes ago
			}, error => {
				if (error) console.error(error);
			});
		});
		return;
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
