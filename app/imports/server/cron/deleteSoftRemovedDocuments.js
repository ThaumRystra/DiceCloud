import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import LibraryNodes from '/imports/api/library/LibraryNodes.js';
import { assertAdmin } from '/imports/api/sharing/sharingPermissions.js';
import { SyncedCron } from 'meteor/percolate:synced-cron';

Meteor.startup(() => {
	const collections = [
		CreatureProperties,
    LibraryNodes,
	];

	/**
	 * Deletes all soft removed documents that were removed more than 30 minutes ago
	 * and were not restored
	 * @return {Number} Number of documents removed
	 */
	const deleteOldSoftRemovedDocs = function(){
		const now = new Date();
		const thirtyMinutesAgo = new Date(now.getTime() - 30*60000);
		collections.forEach(collection => {
			collection.remove({
				removed: true,
				removedAt: {$lt: thirtyMinutesAgo} // dates *before* 30 minutes ago
			}, function(error){
				if (error){
					console.error(error);
				}
			});
		});
	};

	SyncedCron.add({
		name: 'deleteSoftRemovedDocs',
		schedule: function(parser) {
			return parser.text('every 2 hours');
		},
		job: deleteOldSoftRemovedDocs,
	});

	SyncedCron.start();

	// Add a method to manually trigger removal
	Meteor.methods({
		deleteOldSoftRemovedDocs() {
      assertAdmin(this.userId);
			this.unblock();
			deleteOldSoftRemovedDocs();
		},
	});
});
