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
  async run() {
    const userId = Meteor.userId();
    if (!userId) throw new Meteor.Error('No user',
      'You must be logged in to recalculate your file use');
    const user = await Meteor.users.findOneAsync(userId);
    if (!user) {
      throw new Meteor.Error('noUser', 'User not found');
    }
    await updateFileStorageUsedWork(userId);
  }
});

export default updateFileStorageUsed;

export async function updateFileStorageUsedWork(userId) {
  if (!userId) {
    throw new Meteor.Error('idRequired',
      'No user ID was provided to update file storage used')
  }

  let sum = 0;
  for (const collection of fileCollections) {
    await collection.find({ userId }, { fields: { size: 1 } }).forEachAsync(file => {
      sum += file.size;
    });
  }

  await Meteor.users.updateAsync(userId, {
    $set: {
      fileStorageUsed: sum,
    }
  });
}

export async function incrementFileStorageUsed(userId, amount) {
  if (!userId) {
    throw new Meteor.Error('idRequired',
      'No user ID was provided to update file storage used')
  }

  const user = await Meteor.users.findOneAsync(userId);
  if (!user) {
    throw new Meteor.Error('noUser', 'User not found');
  }

  if (user.fileStorageUsed === undefined) {
    // The user doesn't have a current value for storage used, calculate it
    // from scratch
    await updateFileStorageUsedWork(userId);
  } else {
    await Meteor.users.updateAsync(userId, {
      $inc: {
        fileStorageUsed: amount,
      }
    });
  }
}
