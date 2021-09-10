
/**
 * Iterate through all the defining properties and choose the highest
 * `baseValue.value`
 */
export default function aggregateBaseValue({node, linkedNode, link}){
  if (link.data !== 'definition') return;
  const propBaseValue = linkedNode.data.baseValue?.value;
  if (propBaseValue === undefined) return;
  if (node.baseValue === undefined || propBaseValue > node.baseValue){
    node.baseValue = propBaseValue;
  }
}
