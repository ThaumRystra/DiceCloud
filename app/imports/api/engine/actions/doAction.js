import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import getRootCreatureAncestor from '/imports/api/creature/creatureProperties/getRootCreatureAncestor.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { CreatureLogSchema, insertCreatureLogWork } from '/imports/api/creature/log/CreatureLogs.js';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import applyProperty from './applyProperty.js';

const doAction = new ValidatedMethod({
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
    scope: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  mixins: [RateLimiterMixin],
  rateLimit: {
    numRequests: 10,
    timeInterval: 5000,
  },
  run({actionId, targetIds = [], scope}) {
    let action = CreatureProperties.findOne(actionId);
		// Check permissions
    let creature = getRootCreatureAncestor(action);

    assertEditPermission(creature, this.userId);

    // Get all the targets and make sure we can edit them
    let targets = [];
    targetIds.forEach(targetId => {
      let target = Creatures.findOne(targetId);
      assertEditPermission(target, this.userId);
      targets.push(target);
    });

    // Fetch all the action's ancestor creatureProperties
    const ancestorIds = [];
    action.ancestors.forEach(ref => {
      if (ref.collection === 'creatureProperties') {
        ancestorIds.push(ref.id);
      }
    });

    // Get cursor of ancestors
    const ancestors = CreatureProperties.find({
      _id: {$in: ancestorIds},
    }, {
      sort: {order: 1},
    });

    // Get cursor of the properties
    const properties = CreatureProperties.find({
      $or: [{_id: action._id}, {'ancestors.id': action._id}],
      removed: {$ne: true},
    }, {
      sort: {order: 1},
    });

    // Do the action
    doActionWork({creature, targets, properties, ancestors, method: this, methodScope: scope});

    // Recompute all involved creatures
    Creatures.update({
      _id: { $in: [creature._id, ...targetIds] }
    }, {
      $set: {dirty: true},
    });
  },
});

export default doAction;

export function doActionWork({
  creature, targets, properties, ancestors, method, methodScope = {}, log
}){
  // get the docs
  const ancestorScope = getAncestorScope(ancestors);
  const propertyForest = nodeArrayToTree(properties);
  if (propertyForest.length !== 1){
    throw new Meteor.Error(`The action has ${propertyForest.length} top level properties, expected 1`);
  }

  // Create the log
  if (!log) log = CreatureLogSchema.clean({
    creatureId: creature._id,
    creatureName: creature.name,
  });

  // Apply the top level property, it is responsible for applying its children
  // recursively
  const scope = {
    ...creature.variables,
    ...ancestorScope,
    ...methodScope
  }
  applyProperty(propertyForest[0], {
    creature,
    targets,
    scope,
    log,
  });

  // Insert the log
  insertCreatureLogWork({log, creature, method});
}

// Assumes ancestors are in tree order already
function getAncestorScope(ancestors){
  let scope = {};
  ancestors.forEach(prop => {
    scope[`#${prop.type}`] = prop;
  });
  return scope;
}
