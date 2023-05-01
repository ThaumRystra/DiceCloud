import recalculateCalculation from '/imports/api/engine/actions/applyPropertyByType/shared/recalculateCalculation.js';
import recalculateInlineCalculations from '/imports/api/engine/actions/applyPropertyByType/shared/recalculateInlineCalculations.js';
import { getPropertyDescendants } from '/imports/api/engine/loadCreatures.js';
import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import applyProperty from '/imports/api/engine/actions/applyProperty.js';
import { difference, intersection } from 'lodash';
import getEffectivePropTags from '/imports/api/engine/computation/utility/getEffectivePropTags.js';

export function applyNodeTriggers(node, timing, actionContext) {
  const prop = node.node;
  const type = prop.type;
  const triggers = actionContext.triggers?.doActionProperty?.[type]?.[timing];
  if (triggers) {
    triggers.forEach(trigger => {
      applyTrigger(trigger, prop, actionContext);
    });
  }
}

export function applyTriggers(triggers = [], prop, actionContext) {
  // Apply the triggers
  triggers.forEach(trigger => {
    applyTrigger(trigger, prop, actionContext)
  });
}

export function applyTrigger(trigger, prop, actionContext) {
  // If there is a prop we are applying the trigger from,
  // don't fire if the tags don't match
  if (prop && !triggerMatchTags(trigger, prop)) {
    return;
  }

  // Prevent trigger from firing if it's inactive
  if (trigger.inactive) {
    return;
  }
  
  // Prevent triggers from firing if their condition is false
  if (trigger.condition?.parseNode) {
    recalculateCalculation(trigger.condition, actionContext);
    if (!trigger.condition.value) return;
  }

  // Prevent triggers from firing themselves in a loop
  if (trigger.firing) {
    /*
    log.content.push({
      name: trigger.name || 'Trigger',
      value: 'Trigger can\'t fire itself',
      inline: true,
    });
    */
    return;
  }
  trigger.firing = true;

  // Fire the trigger
  const content = {
    name: trigger.name || 'Trigger',
    value: trigger.description,
    inline: false,
  }
  if (trigger.description?.text){
    recalculateInlineCalculations(trigger.description, actionContext);
    content.value = trigger.description.value;
  }
  if(!trigger.silent) actionContext.addLog(content);

  // Get all the trigger's properties and apply them
  const properties = getPropertyDescendants(actionContext.creature._id, trigger._id);
  properties.sort((a, b) => a.order - b.order);
  const propertyForest = nodeArrayToTree(properties);
  propertyForest.forEach(node => {
    applyProperty(node, actionContext);
  });

  trigger.firing = false;
}

function triggerMatchTags(trigger, prop) {
  let matched = false;
  const propTags = getEffectivePropTags(prop);
  // Check the target tags
  if (
    !trigger.targetTags?.length ||
    difference(trigger.targetTags, propTags).length === 0
  ) {
    matched = true;
  }
  // Check the extra tags
  trigger.extraTags?.forEach(extra => {
    if (extra.operation === 'OR') {
      if (matched) return;
      if (
        !extra.tags.length ||
        difference(extra.tags, propTags).length === 0
      ) {
        matched = true;
      }
    } else if (extra.operation === 'NOT') {
      if (
        extra.tags.length &&
        intersection(extra.tags, propTags)
      ) {
        return false;
      }
    }
  });
  return matched;
}
