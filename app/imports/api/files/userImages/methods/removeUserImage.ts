import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { incrementFileStorageUsed } from '/imports/api/users/methods/updateFileStorageUsed';
import UserImages from '/imports/api/files/userImages/UserImages';

const removeUserImage = new ValidatedMethod({
  name: 'userImages.methods.remove',
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
  async run({ fileId }) {
    if (!this.userId) {
      throw new Meteor.Error('logged-out',
        'The user must be logged in to remove a file');
    }
    // fetch the file
    const file = UserImages.findOne({ _id: fileId }).get();
    if (!file) {
      throw new Meteor.Error('File not found',
        'The requested creature archive does not exist');
    }
    // Assert ownership
    const userId = file?.userId;
    if (!userId || userId !== this.userId) {
      throw new Meteor.Error('Permission denied',
        'You can only restore creatures you own');
    }
    //Remove the archive once the restore succeeded
    UserImages.remove({ _id: fileId });
    // Update the user's file storage limits
    incrementFileStorageUsed(userId, -file.size);
  },
});

export default removeUserImage;
