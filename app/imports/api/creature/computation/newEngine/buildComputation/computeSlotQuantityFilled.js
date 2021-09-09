/**
 * Only computes `totalFilled`, need to compute `quantityExpected.value`
 * before `spacesLeft` can be computed
 */
export default function computeSlotQuantityFilled(node, dependencyGraph){
  let slot = node.node;
  slot.totalFilled = 0;
  node.children.forEach(child => {
    let childProp = child.node;
    dependencyGraph.addLink(slot._id, childProp._id)
    if (childProp.type === 'slotFiller'){
      slot.totalFilled += child.slotQuantityFilled;
    } else {
      slot.totalFilled++;
    }
  });
}
