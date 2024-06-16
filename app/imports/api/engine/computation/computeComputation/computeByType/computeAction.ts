import CreatureComputation from '/imports/api/engine/computation/CreatureComputation';
import { Node } from 'ngraph.graph';

export default function computeAction(computation: CreatureComputation, node: Node) {
  const prop = node.data;
  if (Number.isFinite(prop.uses?.value)) {
    prop.usesLeft = prop.uses.value - (prop.usesUsed || 0);
    if (!prop.usesLeft) {
      prop.insufficientResources = true;
    }
  }
  computeResources(computation, node);
  if (!prop.resources) return;
  prop.resources.conditions?.forEach(conObj => {
    const condition = conObj.condition;
    if (!condition) return;
    if (condition.calculation && !condition.value) {
      prop.insufficientResources = true;
    }
  });
  prop.resources.itemsConsumed?.forEach(itemConsumed => {
    if (!itemConsumed?.itemId || itemConsumed.available < itemConsumed.quantity?.value) {
      prop.insufficientResources = true;
    }
  });
  prop.resources.attributesConsumed?.forEach(attConsumed => {
    if (!attConsumed?.variableName) return;
    if (!(attConsumed.available >= attConsumed.quantity?.value)) {
      prop.insufficientResources = true;
    }
  });
}

function computeResources(computation, node) {
  const resources = node.data?.resources;
  if (!resources) return;
  resources.attributesConsumed.forEach(attConsumed => {
    if (!attConsumed.variableName) return;
    const att = computation.scope[attConsumed.variableName];
    if (!att?._id) return;
    attConsumed.available = att.value;
    attConsumed.statName = att.name;
  });
}
