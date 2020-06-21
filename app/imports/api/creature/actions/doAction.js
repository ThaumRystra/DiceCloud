import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties, { getCreature } from '/imports/api/creature/CreatureProperties.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/recomputeCreature.js';
import { nodesToTree } from '/imports/api/parenting/parenting.js';
import applyProperties from '/imports/api/creature/actions/applyProperties.js';

const doAction = new ValidatedMethod({
  name: 'creatureProperties.doAction',
  validate: new SimpleSchema({
    actionId: SimpleSchema.RegEx.Id,
    targetId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      optional: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  run({actionId, targetId}) {
    let action = CreatureProperties.findOne(actionId);
		// Check permissions
    let creature = getCreature(action);
    assertEditPermission(creature, this.userId);
    let target = undefined;
    if (targetId) {
      target = getCreature(targetId);
      assertEditPermission(target, this.userId);
    }
		doActionWork({action, creature, target});
    // Note this only recomputes the top-level creature, not the nearest one
		recomputeCreatureByDoc(creature);
    if (target){
      recomputeCreatureByDoc(target);
    }
  },
});

function doActionWork({action, creature, target}){
  let actionContext = {};
  let decendantForest = nodesToTree({
    collection: CreatureProperties,
    ancestorId: action._id,
  });
  let startingForest = [{
    node: action,
    children: decendantForest,
  }];
  applyProperties({
    forest: startingForest,
    creature,
    target,
    actionContext
  });
}

export default doAction;
