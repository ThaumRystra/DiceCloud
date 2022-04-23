import SCHEMA_VERSION from '/imports/constants/SCHEMA_VERSION.js';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import CreatureLogs from '/imports/api/creature/log/CreatureLogs.js';
import Experiences from '/imports/api/creature/experience/Experiences.js';
import { removeCreatureWork } from '/imports/api/creature/creatures/methods/removeCreature.js';
import ArchiveCreatureFiles from '/imports/api/creature/archive/ArchiveCreatureFiles.js';
import assertHasCharactersSlots from '/imports/api/creature/creatures/methods/assertHasCharacterSlots.js';
import { incrementFileStorageUsed } from '/imports/api/users/methods/updateFileStorageUsed.js';

const removeArchiveCreature = new ValidatedMethod({
  name: 'ArchiveCreatureFiles.methods.removeArchiveCreature',
  validate: new SimpleSchema({
    'fileId': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  async run({ fileId }) {
    // fetch the file
    const file = ArchiveCreatureFiles.findOne({ _id: fileId }).get();
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
    ArchiveCreatureFiles.remove({ _id: fileId });
    // Update the user's file storage limits
    incrementFileStorageUsed(userId, -file.size);
  },
});

export default removeArchiveCreature;
