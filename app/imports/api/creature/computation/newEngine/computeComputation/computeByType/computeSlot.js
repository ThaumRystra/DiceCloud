export default function computSlot(computation, node){
  const prop = node.data;
  if (prop.quantityExpected){
    prop.spaceLeft = prop.quantityExpected - prop.totalFilled;
  }
}
