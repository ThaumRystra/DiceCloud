import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import { CreatureLogSchema, insertCreatureLogWork } from '/imports/api/creature/log/CreatureLogs.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import computeCreature from '/imports/api/engine/computeCreature.js';
import nodesToTree from '/imports/api/parenting/nodesToTree.js';
import applyProperties from '/imports/api/creature/actions/applyProperties.js';
import getAncestorContext from '/imports/api/creature/actions/getAncestorContext.js';

const doAction = new ValidatedMethod({
  name: 'creatureProperties.doAction',
  validate: new SimpleSchema({
    actionId: SimpleSchema.RegEx.Id,
    targetIds: {
      type: Array,
      defaultValue: [],
      maxCount: 10,
      optional: true,
    },
    'targetIds.$': {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  run({actionId, targetIds = []}) {
    let action = CreatureProperties.findOne(actionId);
		// Check permissions
    let creature = getRootCreatureAncestor(action);

    // Build ancestor context
    let actionContext = getAncestorContext(action);

    assertEditPermission(creature, this.userId);
    let targets = [];
    targetIds.forEach(targetId => {
      let target = Creatures.findOne(targetId);
      assertEditPermission(target, this.userId);
      targets.push(target);
    });
		doActionWork({action, creature, targets, actionContext, method: this});

    // recompute creatures
    computeCreature(creature._id);

    targets.forEach(target => {
      computeCreature(target._id);
    });
  },
});

export function doActionWork({
  action,
  creature,
  targets,
  actionContext = {},
  method
}){
  // Create the log
  let log = CreatureLogSchema.clean({
    creatureId: creature._id,
    creatureName: creature.name,
  });

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
    actionContext,
    creature,
    targets,
    log,
  });
  insertCreatureLogWork({log, creature, method});
}

export default doAction;
