import Creatures from '/imports/api/creature/creatures/Creatures';
import archiveCreature from '/imports/api/creature/archive/methods/archiveCreatureToFile';
import { assertAdmin } from '/imports/api/sharing/sharingPermissions';
import { SyncedCron } from 'meteor/littledata:synced-cron';
const archiveAfterDays = Meteor.settings?.archiveAfterDays;

Meteor.startup(() => {
  /**
   * Archive all creatures older than the configured amount of days.
   */
  const archiveOldCreatures = function () {
    console.log("archiver " + archiveAfterDays + " type: " + typeof archiveAfterDays);
    if (typeof archiveAfterDays != 'number') {
      return;
    }
    const now = new Date();
    const expire = new Date(now.getTime() - (archiveAfterDays * 24 * 60 * 60 * 1000));
    console.log("archiving all creatures after " + expire);
    Creatures.find({ lastComputedAt: { $lt: expire }}, { _id: 1 }).forEach( creature => {
      console.log("archiving " + creature._id);
      archiveCreature(creature._id);
    });
  }

  SyncedCron.add({
    name: 'archiveOldCreatures',
    schedule: function (parser) {
      return parser.text('every 2 minutes');
    },
    job: archiveOldCreatures,
  });

  SyncedCron.start();

  // Add a method to manually trigger removal
  Meteor.methods({
    archiveOldCreatures() {
      assertAdmin(this.userId);
      this.unblock();
      archiveOldCreatures();
    },
  });
});
