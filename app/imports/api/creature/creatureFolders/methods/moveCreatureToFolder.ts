import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';

const moveCreatureToFolder = new ValidatedMethod({
  name: 'creatureFolders.methods.moveCreatureToFolder',
  validate: null,
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ creatureId, folderId }: { creatureId: string, folderId: string }) {
    // Ensure logged in
    const userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('creatureFolders.methods.updateName.denied',
        'You need to be logged in to remove a folder');
    }
    // Check that this folder is owned by the user
    if (folderId) {
      const existingFolder = await CreatureFolders.findOneAsync(folderId);
      if (existingFolder?.owner !== userId) {
        throw new Meteor.Error('creatureFolders.methods.updateName.denied',
          'This folder does not belong to you');
      }
    }
    // Remove from other folders
    await CreatureFolders.updateAsync({
      owner: userId
    }, {
      $pull: { creatures: creatureId },
    }, {
      multi: true,
    });
    if (folderId) {
      // Add to this folder
      await CreatureFolders.updateAsync(folderId, {
        $addToSet: { creatures: creatureId },
      });
    }
  },
});

export default moveCreatureToFolder;
