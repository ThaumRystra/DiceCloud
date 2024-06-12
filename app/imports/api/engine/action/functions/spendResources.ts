import { getFromScope } from '/imports/api/creature/creatures/CreatureVariables';
import { EngineAction } from '/imports/api/engine/action/EngineActions';
import { getEffectiveActionScope } from '/imports/api/engine/action/functions/getEffectiveActionScope';
import recalculateCalculation from '/imports/api/engine/action/functions/recalculateCalculation';
import TaskResult from '/imports/api/engine/action/tasks/TaskResult';
import applyTask from '/imports/api/engine/action/tasks/applyTask';
import { getSingleProperty } from '/imports/api/engine/loadCreatures';
import { hasAncestorRelationship } from '/imports/api/parenting/parentingFunctions';

export default async function spendResources(
  action: EngineAction, prop, targetIds: string[], result: TaskResult, userInput
) {
  // Use uses
  if (prop.usesLeft) {
    result.mutations.push({
      targetIds,
      updates: [{
        propId: prop._id,
        inc: { usesUsed: 1, usesLeft: -1 },
        type: prop.type,
      }],
      contents: [{
        name: 'Uses left',
        value: `${prop.usesLeft - 1}`,
        inline: true,
        silenced: prop.silent,
      }]
    });
  }

  // Iterate through all the resources consumed and damage them
  if (prop.resources?.attributesConsumed?.length) {
    for (const att of prop.resources.attributesConsumed) {
      const scope = await getEffectiveActionScope(action);
      const statToDamage = await getFromScope(att.variableName, scope);
      await recalculateCalculation(att.quantity, action, 'reduce', userInput);
      await applyTask(action, {
        prop,
        targetIds: [action.creatureId],
        subtaskFn: 'damageProp',
        params: {
          operation: 'increment',
          value: +att.quantity?.value || 0,
          targetProp: statToDamage,
        },
      }, userInput);
    }
  }

  // Iterate through all the items consumed and consume them
  if (prop.resources?.itemsConsumed?.length) {
    for (const itemConsumed of prop.resources.itemsConsumed) {
      await recalculateCalculation(itemConsumed.quantity, action, 'reduce', userInput);
      if (!itemConsumed.itemId) {
        throw 'No ammo was selected';
      }
      const item = getSingleProperty(action.creatureId, itemConsumed.itemId);
      if (!item || item.root.id !== prop.root.id) {
        throw 'The prop\'s ammo was not found on the creature';
      }
      const quantity = +itemConsumed?.quantity?.value;
      if (
        !quantity ||
        !isFinite(quantity)
      ) continue;

      await applyTask(action, {
        prop,
        targetIds,
        subtaskFn: 'consumeItemAsAmmo',
        params: {
          value: quantity,
          item,
          // If the item is an ancestor or descendant of this prop, skip the item's children to avoid
          // an infinite loop
          skipChildren: hasAncestorRelationship(item, prop),
        },
      }, userInput);
    }
  }
}
