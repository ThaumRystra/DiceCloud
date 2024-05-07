import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';

const insertCreatureFolder = new ValidatedMethod({
  name: 'creatureFolders.methods.insert',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run() {
    // Ensure logged in
    let userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('creatureFolders.methods.insert.denied',
        'You need to be logged in to insert a folder');
    }
    // Limit folders to 50 per user
    let existingFolders = CreatureFolders.find({
      owner: userId
    }, {
      fields: { order: 1 },
      sort: { left: -1 }
    });
    if (existingFolders.count() >= 50) {
      throw new Meteor.Error('creatureFolders.methods.insert.denied',
        'You can not have more than 50 folders');
    }
    // Make the new folder the last in the order
    let order = 0;
    let lastFolder = existingFolders.fetch()[0];
    if (lastFolder) {
      order = (lastFolder.order || 0) + 1;
    }
    // Insert
    return CreatureFolders.insert({
      name: 'Folder',
      owner: userId,
      order,
    });
  },
});

export default insertCreatureFolder;
