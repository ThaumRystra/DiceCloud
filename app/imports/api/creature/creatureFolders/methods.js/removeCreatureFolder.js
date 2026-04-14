import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';

const removeCreatureFolder = new ValidatedMethod({
  name: 'creatureFolders.methods.remove',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id }) {
    // Ensure logged in
    const userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('creatureFolders.methods.updateName.denied',
        'You need to be logged in to remove a folder');
    }
    // Check that this folder is owned by the user
    const existingFolder = await CreatureFolders.findOneAsync(_id);
    if (existingFolder?.owner !== userId) {
      throw new Meteor.Error('creatureFolders.methods.updateName.denied',
        'This folder does not belong to you');
    }
    // Remove
    return CreatureFolders.removeAsync(_id);
  },
});

export default removeCreatureFolder;
