export default function computSlot(graph, node){
  const prop = node.data;
  if (prop.quantityExpected){
    prop.spaceLeft = prop.quantityExpected - prop.totalFilled;
  }
}
