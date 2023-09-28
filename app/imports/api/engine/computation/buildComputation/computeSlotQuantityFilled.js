/**
 * Only computes `totalFilled`, need to compute `quantityExpected.value`
 * before `spacesLeft` can be computed
 */
export default function computeSlotQuantityFilled(node, dependencyGraph) {
  let slot = node.doc;
  if (slot.type !== 'propertySlot') return;
  slot.totalFilled = 0;
  node.children.forEach(child => {
    let childProp = child.doc;
    dependencyGraph.addLink(slot._id, childProp._id, 'slotFill');
    if (
      Number.isFinite(childProp.slotQuantityFilled)
    ) {
      slot.totalFilled += childProp.slotQuantityFilled;
    } else {
      slot.totalFilled++;
    }
  });
}
