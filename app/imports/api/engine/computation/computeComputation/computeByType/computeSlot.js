export default function computSlot(computation, node){
  const prop = node.data;
  if (prop.quantityExpected && prop.quantityExpected.value){
    prop.spaceLeft = prop.quantityExpected.value - prop.totalFilled;
  }
}
