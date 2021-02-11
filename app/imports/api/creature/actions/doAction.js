import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/Creatures.js';
import CreatureLogs, { CreatureLogSchema, insertCreatureLogWork } from '/imports/api/creature/log/CreatureLogs.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { assertEditPermission } from '/imports/api/creature/creaturePermissions.js';
import { recomputeCreatureByDoc } from '/imports/api/creature/computation/methods/recomputeCreature.js';
import { nodesToTree } from '/imports/api/parenting/parenting.js';
import applyProperties from '/imports/api/creature/actions/applyProperties.js';

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
    assertEditPermission(creature, this.userId);
    let targets = [];
    targetIds.forEach(targetId => {
      let target = Creatures.findOne(targetId);
      assertEditPermission(target, this.userId);
      targets.push(target);
    });
		doActionWork({action, creature, targets, method: this});

    // recompute creatures
		recomputeCreatureByDoc(creature);
    targets.forEach(target => {
      recomputeCreatureByDoc(target);
    });
  },
});

export function doActionWork({
  action,
  creature,
  targets,
  context = {},
  method
}){
  // Create the log
  let log = CreatureLogSchema.clean({
    name: action.name,
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
    actionContext: context,
    creature,
    targets,
    log,
  });
  insertCreatureLogWork({log, creature, method});
}

export default doAction;
