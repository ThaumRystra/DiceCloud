import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import computeCreature from '/imports/api/engine/computeCreature.js';
import doAction from '../doAction.js';

const commitAction = new ValidatedMethod({
  name: 'creatureProperties.doAction',
  validate: new SimpleSchema({
    actionId: SimpleSchema.RegEx.Id,
    targetIds: {
      type: Array,
      defaultValue: [],
      maxCount: 20,
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
    doAction({action, creature, targets, method: this});

    // recompute creatures
    computeCreature(creature._id);

    targets.forEach(target => {
      computeCreature(target._id);
    });
  },
});

export default commitAction;
