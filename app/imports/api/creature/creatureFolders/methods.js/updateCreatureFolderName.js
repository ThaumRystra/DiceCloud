import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';

const updateCreatureFolderName = new ValidatedMethod({
  name: 'creatureFolders.methods.updateName',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, name }) {
    // Ensure logged in
    const userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('creatureFolders.methods.updateName.denied',
        'You need to be logged in to update a folder');
    }
    // Check that this folder is owned by the user
    const existingFolder = await CreatureFolders.findOneAsync(_id);
    if (existingFolder.owner !== userId) {
      throw new Meteor.Error('creatureFolders.methods.updateName.denied',
        'This folder does not belong to you');
    }
    // Update
    return CreatureFolders.updateAsync(_id, { $set: { name } });
  },
});

export default updateCreatureFolderName;
