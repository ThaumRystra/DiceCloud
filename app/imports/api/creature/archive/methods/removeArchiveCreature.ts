import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import {ArchiveCreatureFiles, type ArchiveCreatureFileId} from '/imports/api/creature/archive/ArchiveCreatureFiles';
import { incrementFileStorageUsed } from '/imports/api/users/methods/updateFileStorageUsed';
import { deleteJsonFile } from '/imports/api/files/server/s3FileStorage';

const removeArchiveCreature = new ValidatedMethod({
  name: 'ArchiveCreatureFiles.methods.removeArchiveCreature',
  validate: new SimpleSchema({
    'fileId': {
      type: String,
      max: 32,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ fileId }: {fileId: ArchiveCreatureFileId}) {
    // fetch the file
    const file = await ArchiveCreatureFiles.findOneAsync({ _id: fileId }, {fields: {fileName: 1, userId: 1, sizeKb: 1, cat: 1}});
    if (!file) {
      throw new Meteor.Error('File not found',
        'The requested creature archive does not exist');
    }
    // Assert ownership
    const userId = file.userId;
    if (!userId || userId !== this.userId) {
      throw new Meteor.Error('Permission denied',
        'You can only restore creatures you own');
    }
    // Delete the file on s3
    await deleteJsonFile(file.fileName);
    // Remove the file reference from the db
    await ArchiveCreatureFiles.removeAsync({ _id: fileId });
    // Update the user's file storage limits
    await incrementFileStorageUsed(userId, -file.sizeKb);
  },
});

export default removeArchiveCreature;
