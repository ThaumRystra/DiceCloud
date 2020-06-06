import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import Creatures from '/imports/api/creature/Creatures.js';
import CreatureProperties from '/imports/api/creature/CreatureProperties.js';
import getActiveProperties, { getActivePropertyFilter } from '/imports/api/creature/getActiveProperties.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { recomputeCreatureById } from '/imports/api/creature/computation/recomputeCreature.js';

const restCreature = new ValidatedMethod({
  name: 'creature.methods.longRest',
  validate: new SimpleSchema({
    creatureId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
    restType: {
      type: String,
      allowedValues: ['shortRest', 'longRest'],
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 5,
    timeInterval: 5000,
  },
  run({creatureId, restType}) {
    let creature = Creatures.findOne(creatureId, {
      fields: {
        owner: 1,
        writers: 1,
        settings: 1,
      }
    }) ;
    // Need edit permissions
    assertEditPermission(creature, this.userId);

    // Long rests reset short rest properties as well
    let resetFilter;
    if (restType === 'shortRest'){
      resetFilter = 'shortRest'
    } else {
      resetFilter = {$in: ['shortRest', 'longRest']}
    }
    // Only apply to active properties
    let filter = getActivePropertyFilter({
      filter: {reset: resetFilter},
      ancestorId: creatureId,
      includeUntoggled: true,
    });
    // update all attribute's damage
    filter.type = 'attribute';
    CreatureProperties.update(filter, {
      $set: {damage: 0}
    }, {
      selector: {type: 'attribute'},
      multi: true,
    });
    // Update all action-like properties' usesUsed
    filter.type = {$in: [
      'action',
      'attack',
      'spell'
    ]};
    CreatureProperties.update(filter, {
      $set: {usesUsed: 0}
    }, {
      selector: {type: 'action'},
      multi: true,
    });
    // Reset half hit dice on a long rest, starting with the highest dice
    if (restType === 'longRest'){
      let hitDice = getActiveProperties({
        ancestorId: creatureId,
        filter: {type: 'attribute', attributeType: 'hitDice'},
        options: {fields: {
          hitDiceSize: 1,
          damage: 1,
          value: 1,
        }},
      });
      // Use a collator to do sorting in natural order
      let collator = new Intl.Collator('en', {
        numeric: true, sensitivity: 'base'
      });
      // Get the hit dice in decending order of hitDiceSize
      let compare = (a, b) => collator.compare(b.hitDiceSize, a.hitDiceSize)
      hitDice.sort(compare);
      // Get the total number of hit dice that can be recovered this rest
      let totalHd = hitDice.reduce((sum, hd) => sum + (hd.value || 0), 0);
      let resetMultiplier = creature.settings.hitDiceResetMultiplier || 0.5;
      let recoverableHd = Math.max(Math.floor(totalHd*resetMultiplier), 1);
      // recover each hit dice in turn until the recoverable amount is used up
      let amountToRecover, resultingDamage;
      hitDice.forEach(hd => {
        if (!recoverableHd) return;
        amountToRecover = Math.min(recoverableHd, hd.damage || 0);
        if (!amountToRecover) return;
        recoverableHd -= amountToRecover;
        resultingDamage = hd.damage - amountToRecover;
        CreatureProperties.update(hd._id, {
          $set: {damage: resultingDamage}
        }, {
          selector: {type: 'attribute'},
        });
      });
    }
    recomputeCreatureById(creatureId);
  },
});

export default restCreature;
