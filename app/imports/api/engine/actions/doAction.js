import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { CreatureLogSchema, insertCreatureLogWork } from '/imports/api/creature/log/CreatureLogs.js';
import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import applyProperty from './applyProperty.js';
import computeCreature from '/imports/api/engine/computeCreature.js';

export default function doAction({actionId, targetIds, method}){
  // get the docs
  const {
    creature, targets, properties, ancestors
  } = fetchActionDocs(actionId, targetIds);
  const ancestorScope = getAncestorScope(ancestors);
  const propertyForest = nodeArrayToTree(properties);
  if (propertyForest.length !== 1){
    throw new Meteor.Error(`The action has ${propertyForest.length} top level properties, expected 1`);
  }

  // Create the log
  let log = CreatureLogSchema.clean({
    creatureId: creature._id,
    creatureName: creature.name,
  });

  // Apply the top level property, it is responsible for applying its children
  // recursively
  const scope = {
    ...creature.variables,
    ...ancestorScope,
  }
  applyProperty(propertyForest[0], {
    creature,
    targets,
    scope,
    log,
  });

  // Insert the log
  insertCreatureLogWork({log, creature, method});

  // Recompute the creature and targets
  Meteor.defer(() => computeCreature(creature._id));
  targetIds.forEach(targetId => {
    Meteor.defer(() => computeCreature(targetId));
  });
}

function fetchActionDocs(actionId, targetIds){
  // Fetch the action with ancestors only
  const action = CreatureProperties.findOne({
    _id: actionId,
    removed: {$ne: true},
  }, {
    fields: {ancestors: 1}
  });
  if (!action) throw new Meteor.Error('The specified action was not found');

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

  // Fetch the action's top level ancestor creature
  const creature = Creatures.findOne(action.ancestors[0].id, {
    fields: {variables: 1},
  });
  if (!creature) throw new Meteor.Error('The creature for this action was not found');

  // Fetch all the target creatures
  const targets = Creatures.find({
    _id: targetIds,
  }, {
    fields: {variables: 1},
  }).fetch();

  // Get cursor of the properties
  const properties = CreatureProperties.find({
    $or: [{_id: actionId}, {'ancestors.id': actionId}],
    removed: {$ne: true},
  }, {
    sort: {order: 1},
  });

  return {action, creature, targets, properties, ancestors}
}

// Assumes ancestors are in tree order already
function getAncestorScope(ancestors){
  let scope = {};
  ancestors.forEach(prop => {
    scope[`#${prop.type}`] = prop;
  });
  return scope;
}
