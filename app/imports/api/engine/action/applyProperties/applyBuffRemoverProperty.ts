import { PropTask } from '/imports/api/engine/action/tasks/Task';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import getPropertyTitle from '/imports/api/utility/getPropertyTitle';
import { findLast, filter, difference, intersection } from 'lodash';
import { getPropertiesOfType, getPropertyAncestors } from '/imports/api/engine/loadCreatures';
import getEffectivePropTags from '/imports/api/engine/computation/utility/getEffectivePropTags';
import { applyDefaultAfterPropTasks, applyTaskToEachTarget } from '/imports/api/engine/action/functions/applyTaskGroups';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import InputProvider from '/imports/api/engine/action/functions/userInput/InputProvider';

export default async function applyBuffRemoverProperty(
  task: PropTask, action: EngineAction, result: TaskResult, userInput: InputProvider
) {
  const prop = task.prop;

  const targetIds = prop.target === 'self' ? [action.creatureId] : task.targetIds;

  if (prop.name) {
    // Log Name
    result.appendLog({
      name: getPropertyTitle(prop),
      silenced: prop.silent,
    }, task.targetIds)
  }

  if (targetIds.length > 1) {
    return applyTaskToEachTarget(action, task, targetIds, userInput);
  }

  if (!targetIds.length) {
    return applyDefaultAfterPropTasks(action, prop, task.targetIds, userInput);
  }

  if (targetIds.length !== 1) {
    throw 'At this step, only a single target is supported'
  }
  const targetId = targetIds[0];

  // Remove buffs
  if (prop.targetParentBuff) {
    // Remove nearest ancestor buff
    const ancestors = getPropertyAncestors(action.creatureId, prop._id);
    const nearestBuff = findLast(ancestors, ancestor => ancestor.type === 'buff');
    if (!nearestBuff) {
      result.appendLog({
        name: 'Error',
        value: 'Buff remover does not have a parent buff to remove',
        silenced: prop.silent,
      }, [targetId]);
      return;
    }
    removeBuff(nearestBuff, prop, result);
  } else {
    // Get all the buffs targeted by tags
    const allBuffs = getPropertiesOfType(targetId, 'buff');
    const targetedBuffs = filter(allBuffs, (buff): boolean => {
      if (buff.inactive) return false;
      if (buffRemoverMatchTags(prop, buff)) return true;
      return false;
    });
    // Remove the buffs
    if (prop.removeAll) {
      // Remove all matching buffs
      targetedBuffs.forEach(buff => {
        removeBuff(buff, prop, result);
      });
    } else {
      // Sort in reverse order
      targetedBuffs.sort((a, b) => b.left - a.left);
      // Remove the one with the highest order
      const buff = targetedBuffs[0];
      if (buff) {
        removeBuff(buff, prop, result);
      }
    }
  }
  return applyDefaultAfterPropTasks(action, prop, task.targetIds, userInput);
}

function removeBuff(buff: any, prop, result: TaskResult) {
  result.mutations.push({
    targetIds: result.targetIds,
    removals: [{ propId: buff._id }],
    contents: [{
      name: 'Removed',
      value: `${buff.name || 'Buff'}`,
      ...prop.silent && { silenced: true },
    }],
  });
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
