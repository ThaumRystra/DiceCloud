import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions.js';
import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import {
  getProperyAncestors, getPropertyDecendants
} from '/imports/api/engine/loadCreatures.js';
import Creatures from '/imports/api/creature/creatures/Creatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import applyProperty from './applyProperty.js';
import ActionContext from '/imports/api/engine/actions/ActionContext.js';

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
  run({ actionId, targetIds = [], scope }) {
    // Get action context
    let action = CreatureProperties.findOne(actionId);
    const creatureId = action.ancestors[0].id;
    const actionContext = new ActionContext(creatureId, targetIds, this);

    // Check permissions
    assertEditPermission(actionContext.creature, this.userId);
    actionContext.targets.forEach(target => {
      assertEditPermission(target, this.userId);
    });

    const ancestors = getProperyAncestors(creatureId, action._id);
    ancestors.sort((a, b) => a.order - b.order);

    const properties = getPropertyDecendants(creatureId, action._id);
    properties.push(action);
    properties.sort((a, b) => a.order - b.order);

    // Do the action
    doActionWork({ properties, ancestors, actionContext, methodScope: scope });

    // Recompute all involved creatures
    Creatures.update({
      _id: { $in: [creatureId, ...targetIds] }
    }, {
      $set: { dirty: true },
    });
  },
});

export default doAction;

export function doActionWork({
  properties, ancestors, actionContext, methodScope = {},
}) {
  // get the docs
  const ancestorScope = getAncestorScope(ancestors);
  const propertyForest = nodeArrayToTree(properties);
  if (propertyForest.length !== 1) {
    throw new Meteor.Error(`The action has ${propertyForest.length} top level properties, expected 1`);
  }

  // Include the ancestry and method scope in the context scope
  Object.assign(actionContext.scope, ancestorScope, methodScope);

  // Apply the top level property, it is responsible for applying its children
  // recursively
  applyProperty(propertyForest[0], actionContext);

  // Insert the log
  actionContext.writeLog();
}

// Assumes ancestors are in tree order already
function getAncestorScope(ancestors) {
  let scope = {};
  ancestors.forEach(prop => {
    scope[`#${prop.type}`] = prop;
  });
  return scope;
}
