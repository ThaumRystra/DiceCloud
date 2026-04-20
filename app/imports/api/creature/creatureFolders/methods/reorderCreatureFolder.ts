import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';

const reorderCreatureFolder = new ValidatedMethod({
  name: 'creatureFolders.methods.reorder',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ _id, order }: { _id: string, order: number }) {
    // Ensure logged in
    const userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('creatureFolders.methods.reorder.denied',
        'You need to be logged in to reorder a folder');
    }
    // Check that this folder is owned by the user
    const existingFolder = await CreatureFolders.findOneAsync(_id);
    if (existingFolder?.owner !== userId) {
      throw new Meteor.Error('creatureFolders.methods.reorder.denied',
        'This folder does not belong to you');
    }
    // First give it the new order, it should end in 0.5 putting it between two other docs
    await CreatureFolders.updateAsync(_id, { $set: { order } });
    this.unblock();
    // Reorder all the folders with integer numbers in this new order
    const updates = await CreatureFolders.find({
      owner: userId
    }, {
      fields: { order: 1, },
      sort: { order: 1 }
    }).mapAsync(async (folder, index) => {
      if (folder.order !== index) {
        return CreatureFolders.updateAsync(_id, { $set: { order: index } });
      }
    });
    await Promise.all(updates);
  },
});

export default reorderCreatureFolder;
