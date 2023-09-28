import ArchiveCreatureFiles from '/imports/api/creature/archive/ArchiveCreatureFiles';

Meteor.publish('archiveCreatureFiles', function () {
  return ArchiveCreatureFiles.find({
    userId: this.userId,
  }).cursor;
});
