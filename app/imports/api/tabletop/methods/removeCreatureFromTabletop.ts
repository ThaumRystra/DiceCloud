import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertUserInTabletop } from './shared/tabletopPermissions';
import { assertUserHasPaidBenefits } from '/imports/api/users/patreon/tiers';
import Creatures from '/imports/api/creature/creatures/Creatures';
import updateTabletopPropCount from '/imports/api/tabletop/functions/denormalizeTabletopPropCount';
import { getCreature } from '/imports/api/engine/loadCreatures';
import { removeCreatureWork } from '/imports/api/creature/creatures/methods/removeCreature';
import { assertOwnership } from '/imports/api/creature/creatures/creaturePermissions';

const removeCreatureFromTabletop = new ValidatedMethod({

  name: 'tabletops.removeCreature',

  validate: new SimpleSchema({
    tabletopId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    'creatureIds': {
      type: Array,
    },
    'creatureIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),

  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },

  run({ tabletopId, creatureIds }) {
    if (!this.userId) {
      throw new Meteor.Error('tabletops.removeCreature.denied',
        'You need to be logged in to remove creatures from tabletop');
    }
    assertUserHasPaidBenefits(this.userId);
    assertUserInTabletop(tabletopId, this.userId);

    const creaturesToRemove: any[] = [];
    const creatureIdsToClearTabletopId: string[] = [];

    for (const creatureId of creatureIds) {
      const creature = getCreature(creatureId);
      // Make sure the creature exists and is in this tabletop
      if (!creature || creature.tabletopId !== tabletopId) continue;
      switch (creature.type) {
        // Remove character creatures from the tabletop
        case 'pc':
          creatureIdsToClearTabletopId.push(creatureId);
          break;
        // Delete non player characters and monsters
        case 'npc':
        case 'monster':
          creaturesToRemove.push(creature);
          break;
      }
    }

    // Clear tabletopId from all player characters
    if (creatureIdsToClearTabletopId.length) Creatures.update({
      _id: { $in: creatureIdsToClearTabletopId },
      $or: [
        { writers: this.userId },
        { owner: this.userId },
      ],
    }, {
      $unset: { tabletopId: 1 },
    }, {
      multi: true,
    });

    // Remove all non player characters and monsters
    for (const creature of creaturesToRemove) {
      assertOwnership(creature, this.userId)
      removeCreatureWork(creature._id);
    }

    if (Meteor.isServer) {
      updateTabletopPropCount(tabletopId);
    }
  },
});

export default removeCreatureFromTabletop;
