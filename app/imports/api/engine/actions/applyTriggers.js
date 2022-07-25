import recalculateCalculation from '/imports/api/engine/actions/applyPropertyByType/shared/recalculateCalculation.js';
import recalculateInlineCalculations from '/imports/api/engine/actions/applyPropertyByType/shared/recalculateInlineCalculations.js';
import { getPropertyDecendants } from '/imports/api/engine/loadCreatures.js';
import { nodeArrayToTree } from '/imports/api/parenting/nodesToTree.js';
import applyProperty from '/imports/api/engine/actions/applyProperty.js';
import { difference, intersection } from 'lodash';
import getEffectivePropTags from '/imports/api/engine/computation/utility/getEffectivePropTags.js';

export default function applyTriggers(node, { creature, targets, scope, log }, timing) {
  const prop = node.node;
  const type = prop.type;
  if (creature.triggers?.[type]?.[timing]) {
    creature.triggers[type][timing].forEach(trigger => {
      // Tags
      if (!triggerMatchTags(trigger, prop)) return;
      // Condition
      if (trigger.condition?.parseNode) {
        recalculateCalculation(trigger.condition, scope, log);
        if (!trigger.condition.value) return;
      }
      // Apply
      applyTrigger(trigger, { creature, targets, scope, log });
    });
  }
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

export function applyTrigger(trigger, { creature, targets, scope, log }) {
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
    value: trigger.summary,
    inline: false,
  }
  if (trigger.summary?.text){
    recalculateInlineCalculations(trigger.summary, scope, log);
    content.value = trigger.summary.value;
  }
  log.content.push(content);

  // Get all the trigger's properties and apply them
  const properties = getPropertyDecendants(creature._id, trigger._id);
  properties.sort((a, b) => a.order - b.order);
  const propertyForest = nodeArrayToTree(properties);
  propertyForest.forEach(node => {
    applyProperty(node, {
      creature,
      targets,
      scope,
      log,
    });
  });

  trigger.firing = false;
}
