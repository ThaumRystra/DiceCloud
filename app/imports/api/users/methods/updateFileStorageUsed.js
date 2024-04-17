import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import ArchiveCreatureFiles from '/imports/api/creature/archive/ArchiveCreatureFiles';
import UserImages from '/imports/api/files/userImages/UserImages';
const fileCollections = [ArchiveCreatureFiles, UserImages];

const updateFileStorageUsed = new ValidatedMethod({
  name: 'users.recalculateFileStorageUsed',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run() {
    const userId = Meteor.userId();
    if (!userId) throw new Meteor.Error('No user',
      'You must be logged in to recalculate your file use');
    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error('noUser', 'User not found');
    }
    updateFileStorageUsedWork(userId);
  }
});

export default updateFileStorageUsed;

export function updateFileStorageUsedWork(userId) {
  if (!userId) {
    throw new Meteor.Error('idRequired',
      'No user ID was provided to update file storage used')
  }

  let sum = 0;
  fileCollections.forEach(collection => {
    collection.find({ userId }, { fields: { size: 1 } }).forEach(file => {
      sum += file.size;
    });
  });

  Meteor.users.update(userId, {
    $set: {
      fileStorageUsed: sum,
    }
  });
}

export function incrementFileStorageUsed(userId, amount) {
  if (!userId) {
    throw new Meteor.Error('idRequired',
      'No user ID was provided to update file storage used')
  }

  const user = Meteor.users.findOne(userId);
  if (!user) {
    throw new Meteor.Error('noUser', 'User not found');
  }

  if (user.fileStorageUsed === undefined) {
    // The user doesn't have a current value for storage used, calculate it
    // from scratch
    updateFileStorageUsedWork(userId);
  } else {
    Meteor.users.update(userId, {
      $inc: {
        fileStorageUsed: amount,
      }
    });
  }
}
