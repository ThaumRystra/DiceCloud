import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RateLimiterMixin } from 'ddp-rate-limiter-mixin';
import { assertEditPermission } from '/imports/api/creature/creatures/creaturePermissions';
import { docsToForest } from '/imports/api/parenting/parentingFunctions';
import {
  getPropertyAncestors, getPropertyDescendants
} from '/imports/api/engine/loadCreatures';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import applyProperty from './applyProperty';
import ActionContext from '/imports/api/engine/actions/ActionContext';

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
    const action = CreatureProperties.findOne(actionId);
    if (!action) throw new Meteor.Error('not-found', 'The action was not found');
    const creatureId = action.root.id;
    const actionContext = new ActionContext(creatureId, targetIds, this);

    // Check permissions
    assertEditPermission(actionContext.creature, this.userId);
    actionContext.targets.forEach(target => {
      assertEditPermission(target, this.userId);
    });

    const ancestors = getPropertyAncestors(creatureId, action._id);
    ancestors.sort((a, b) => a.order - b.order);

    const properties = getPropertyDescendants(creatureId, action._id);
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
  const propertyForest = docsToForest(properties);
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
  const scope = {};
  ancestors.forEach(prop => {
    scope[`#${prop.type}`] = prop;
  });
  return scope;
}
