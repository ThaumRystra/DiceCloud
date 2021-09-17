export default function computeAction(graph, node, scope){
  const prop = node.data;
  if (prop.uses){
    prop.usesLeft = prop.uses.value - (prop.usesUsed || 0);
  }
  computeResources(graph, node, scope);
  if (!prop.resources) return;
  prop.resources.itemsConsumed.forEach(itemConsumed => {
    if (!itemConsumed.itemId) return;
    if (itemConsumed.available < itemConsumed.quantity.value){
      prop.insufficientResources = true;
    }
  });
  prop.resources.attributesConsumed.forEach(attConsumed => {
    if (!attConsumed.variableName) return;
    if (attConsumed.available < attConsumed.quantity.value){
      prop.insufficientResources = true;
    }
  });
}

function computeResources(graph, node, scope){
  const resources = node.data?.resources;
  if (!resources) return;
  resources.attributesConsumed.forEach(attConsumed => {
    if (!attConsumed.variableName) return;
    const att = scope[attConsumed.variableName];
    attConsumed.available = att.value;
    attConsumed.statId = att._id;
    attConsumed.statName = att.name;
  });
}
