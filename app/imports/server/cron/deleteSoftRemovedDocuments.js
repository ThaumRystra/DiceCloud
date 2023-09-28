import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import LibraryNodes from '/imports/api/library/LibraryNodes';
import { assertAdmin } from '/imports/api/sharing/sharingPermissions';
import { SyncedCron } from 'meteor/littledata:synced-cron';

Meteor.startup(() => {
  const collections = [
    CreatureProperties,
    LibraryNodes,
  ];

  /**
   * Deletes all soft removed documents that were removed more than 1 day ago
   * and were not restored
   * @return {Number} Number of documents removed
   */
  const deleteOldSoftRemovedDocs = function () {
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    collections.forEach(collection => {
      collection.remove({
        removed: true,
        removedAt: { $lt: yesterday } // dates *before* yesterday
      }, function (error) {
        if (error) {
          console.error(JSON.stringify(error, null, 2));
        }
      });
    });
  };

  SyncedCron.add({
    name: 'deleteSoftRemovedDocs',
    schedule: function (parser) {
      return parser.text('every 10 minutes');
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
