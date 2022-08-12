import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import { union } from 'lodash';
import ActionContext from '/imports/api/engine/actions/ActionContext.js';
import { applyTriggers } from '/imports/api/engine/actions/applyTriggers.js';

const restCreature = new ValidatedMethod({
  name: 'creature.methods.rest',
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
  run({ creatureId, restType }) {
    // Get action context
    const actionContext = new ActionContext(creatureId, [creatureId], this);
    // Check permissions
    assertEditPermission(actionContext.creature, this.userId);

    // Join, sort, and apply before triggers
    const beforeTriggers = union(
      actionContext.triggers.anyRest?.before, actionContext.triggers[restType]?.before
    ).sort((a, b) => a.order - b.order);
    applyTriggers(beforeTriggers, null, actionContext);

    // Rest
    actionContext.addLog({
      name: restType === 'shortRest' ? 'Short rest' : 'Long rest',
    });
    doRestWork(restType, actionContext);

    // Join, sort, and apply after triggers
    const afterTriggers = union(
      actionContext.triggers.anyRest?.after, actionContext.triggers[restType]?.after
    ).sort((a, b) => a.order - b.order);
    applyTriggers(afterTriggers, null, actionContext);

    // Insert log
    actionContext.writeLog();    
  },
});

function doRestWork(restType, actionContext) {
  const creatureId = actionContext.creature._id;
  // Long rests reset short rest properties as well
  let resetFilter;
  if (restType === 'shortRest'){
    resetFilter = 'shortRest'
  } else {
    resetFilter = {$in: ['shortRest', 'longRest']}
  }
  // Only apply to active properties
  let filter = {
    'ancestors.id': creatureId,
    reset: resetFilter,
    removed: { $ne: true },
    inactive: { $ne: true },
  };
  // update all attribute's damage
  filter.type = 'attribute';
  CreatureProperties.update(filter, {
    $set: {
      damage: 0,
      dirty: true,
    }
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
    $set: {
      usesUsed: 0,
      dirty: true,
    }
  }, {
    selector: {type: 'action'},
    multi: true,
  });
  // Reset half hit dice on a long rest, starting with the highest dice
  if (restType === 'longRest'){
    let hitDice = CreatureProperties.find({
      'ancestors.id': creatureId,
      type: 'attribute',
      attributeType: 'hitDice',
      removed: {$ne: true},
      inactive: {$ne: true},
    }, {
      fields: {
        hitDiceSize: 1,
        damage: 1,
        value: 1,
      }
    }).fetch();
    // Use a collator to do sorting in natural order
    let collator = new Intl.Collator('en', {
      numeric: true, sensitivity: 'base'
    });
    // Get the hit dice in decending order of hitDiceSize
    let compare = (a, b) => collator.compare(b.hitDiceSize, a.hitDiceSize)
    hitDice.sort(compare);
    // Get the total number of hit dice that can be recovered this rest
    let totalHd = hitDice.reduce((sum, hd) => sum + (hd.value || 0), 0);
    let resetMultiplier = actionContext.creature.settings.hitDiceResetMultiplier || 0.5;
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
        $set: {
          damage: resultingDamage,
          dirty: true,
        }
      }, {
        selector: {type: 'attribute'},
      });
    });
  }
}

export default restCreature;
