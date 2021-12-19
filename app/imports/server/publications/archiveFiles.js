import ArchiveCreatureFiles from '/imports/api/creature/archive/ArchiveCreatureFiles.js';

Meteor.publish('archiveCreatureFiles', function () {
  return ArchiveCreatureFiles.find({
    userId: this.userId,
  }).cursor;
});
