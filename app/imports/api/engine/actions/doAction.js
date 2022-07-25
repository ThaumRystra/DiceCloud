import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { CreatureLogSchema, insertCreatureLogWork } from '/imports/api/creature/log/CreatureLogs.js';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import {
  getCreature, getVariables, getProperyAncestors, getPropertyDecendants, getPropertiesOfType
} from '/imports/api/engine/loadCreatures.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import applyProperty from './applyProperty.js';
import { groupBy, remove } from 'lodash';

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
    const creatureId = action.ancestors[0].id;
    let creature = getCreature(action.ancestors[0].id);
    assertEditPermission(creature, this.userId);

    // Add the variables to the creature document
    const variables = getVariables(creatureId);
    delete variables._id;
    delete variables._creatureId;
    creature.variables = variables;

    // Get all the targets and make sure we can edit them
    let targets = [];
    targetIds.forEach(targetId => {
      let target = getCreature(targetId);
      assertEditPermission(target, this.userId);

      // add the variables to the target documents
      const variables = getVariables(creatureId);
      delete variables._id;
      delete variables._creatureId;
      target.variables = variables;

      targets.push(target);
    });

    const ancestors = getProperyAncestors(creatureId, action._id);
    ancestors.sort((a, b) => a.order - b.order);

    const properties = getPropertyDecendants(creatureId, action._id);
    properties.push(action);
    properties.sort((a, b) => a.order - b.order);

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

  // Get the triggers
  const triggers = getPropertiesOfType(creature._id, 'trigger');
  remove(triggers, trigger => trigger.event !== 'doActionProperty');
  creature.triggers = groupBy(triggers, 'actionPropertyType');
  for (let type in creature.triggers) {
    creature.triggers[type] = groupBy(creature.triggers[type], 'timing')
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
