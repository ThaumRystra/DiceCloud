import _variable from './computeByType/computeVariable';
import action from './computeByType/computeAction';
import attribute from './computeByType/computeAttribute';
import skill from './computeByType/computeSkill';
import pointBuy from './computeByType/computePointBuy';
import propertySlot from './computeByType/computeSlot';
import container from './computeByType/computeContainer';
import spellList from './computeByType/computeSpellList';
import toggle from './computeByType/computeToggle';
import trigger from './computeByType/computeTrigger';
import _calculation from './computeByType/computeCalculation';
import type { TraversedNode } from '/imports/api/engine/computation/computeCreatureComputation';
import type CreatureComputation from '/imports/api/engine/computation/CreatureComputation';

export type ComputeNode = (computation: CreatureComputation, node: TraversedNode) => Promise<void>

export async function computeByType(
  computation: CreatureComputation,
  node: TraversedNode
): Promise<void> {
  switch (node.data?.type) {
    case '_variable': return _variable(computation, node);
    case undefined: return _variable(computation, node);
    case '_calculation': return _calculation(computation, node);
    case 'action': return action(computation, node);
    case 'attribute': return attribute(computation, node);
    case 'container': return container(computation, node);
    case 'skill': return skill(computation, node);
    case 'pointBuy': return await pointBuy(computation, node);
    case 'propertySlot': return propertySlot(computation, node);
    case 'spell': return action(computation, node);
    case 'spellList': return spellList(computation, node);
    case 'toggle': return toggle(computation, node);
    case 'trigger': return trigger(computation, node);
    // Types not specifically computed
    case 'proficiency':
    case 'damage':
    case 'roll':
    case 'adjustment':
    case 'branch':
    case 'buff':
    case 'buffRemover':
    case 'note':
    case 'savingThrow':
    case 'class':
    case 'classLevel':
    case 'constant':
    case 'creature':
    case 'damageMultiplier':
    case 'effect':
    case 'feature':
    case 'folder':
    case 'item':
    case 'reference':
    case 'pointBuyRow':
      return undefined;
  }
}
