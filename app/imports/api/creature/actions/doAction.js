import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/Creatures.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';
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
    let creature = getRootCreatureAncestor(action);
    assertEditPermission(creature, this.userId);
    let target = undefined;
    if (targetId) {
      target = Creatures.findOne(targetId);
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

export function doActionWork({action, creature, target, context = {}}){
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
    actionContext: context,
    creature,
    target,
  });
}

export default doAction;
