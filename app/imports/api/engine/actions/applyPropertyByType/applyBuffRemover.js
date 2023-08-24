import { findLast, difference, intersection, filter } from 'lodash';
import applyProperty from '../applyProperty.js';
import { applyNodeTriggers } from '/imports/api/engine/actions/applyTriggers.js';
import { getProperyAncestors, getPropertiesOfType } from '/imports/api/engine/loadCreatures.js';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties.js';
import { softRemove } from '/imports/api/parenting/softRemove.js';
import getEffectivePropTags from '/imports/api/engine/computation/utility/getEffectivePropTags.js';
import applyChildren from '/imports/api/engine/actions/applyPropertyByType/shared/applyChildren.js';

export default function applyBuffRemover(node, actionContext) {
  // Apply triggers
  applyNodeTriggers(node, 'before', actionContext);

  const prop = node.node;

  // Log Name
  if (prop.name && !prop.silent) {
    actionContext.addLog({ name: prop.name });
  }

  // Remove buffs
  if (prop.targetParentBuff) {
    // Remove nearest ancestor buff
    const ancestors = getProperyAncestors(actionContext.creature._id, prop._id);
    const nearestBuff = findLast(ancestors, ancestor => ancestor.type === 'buff');
    if (!nearestBuff) {
      actionContext.addLog({
        name: 'Error',
        value: 'Buff remover does not have a parent buff to remove',
      });
      return;
    }
    removeBuff(nearestBuff, actionContext, prop);
  } else {
    // Get all the buffs targeted by tags
    const allBuffs = getPropertiesOfType(actionContext.creature._id, 'buff');
    const targetedBuffs = filter(allBuffs, buff => {
      if (buff.inactive) return false;
      if (buffRemoverMatchTags(prop, buff)) return true;
    });
    // Remove the buffs
    if (prop.removeAll) {
      // Remove all matching buffs
      targetedBuffs.forEach(buff => {
        removeBuff(buff, actionContext, prop);
      });
    } else {
      // Sort in reverse order
      targetedBuffs.sort((a, b) => b.order - a.order);
      // Remove the one with the highest order
      const buff = targetedBuffs[0];
      if (buff) {
        removeBuff(buff, actionContext, prop);
      }
    }
  }
  applyChildren(node, actionContext);
}

function removeBuff(buff, actionContext, prop) {
  if (!prop.silent) actionContext.addLog({
    name: 'Removed',
    value: `${buff.name || 'Buff'}`
  });
  softRemove({ _id: buff._id, collection: CreatureProperties });
}

function buffRemoverMatchTags(buffRemover, prop) {
  let matched = false;
  const propTags = getEffectivePropTags(prop);
  // Check the target tags
  if (
    !buffRemover.targetTags?.length ||
    difference(buffRemover.targetTags, propTags).length === 0
  ) {
    matched = true;
  }
  // Check the extra tags
  buffRemover.extraTags?.forEach(extra => {
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
