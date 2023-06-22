export default function computeSlot(computation, node) {
  const prop = node.data;
  if (prop.quantityExpected && prop.quantityExpected.value) {
    prop.spaceLeft = prop.quantityExpected.value - prop.totalFilled;
  }
}
