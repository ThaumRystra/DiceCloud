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
  run({ creatureId, folderId }) {
    // Ensure logged in
    let userId = this.userId;
    if (!userId) {
      throw new Meteor.Error('creatureFolders.methods.updateName.denied',
        'You need to be logged in to remove a folder');
    }
    // Check that this folder is owned by the user
    if (folderId) {
      let existingFolder = CreatureFolders.findOne(folderId);
      if (existingFolder.owner !== userId) {
        throw new Meteor.Error('creatureFolders.methods.updateName.denied',
          'This folder does not belong to you');
      }
    }
    // Remove from other folders
    CreatureFolders.update({
      owner: userId
    }, {
      $pull: { creatures: creatureId },
    }, {
      multi: true,
    });
    if (folderId) {
      // Add to this folder
      CreatureFolders.update(folderId, {
        $addToSet: { creatures: creatureId },
      });
    }
  },
});

export default moveCreatureToFolder;
