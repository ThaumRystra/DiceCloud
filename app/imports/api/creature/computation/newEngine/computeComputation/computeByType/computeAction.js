export default function computeAction(computation, node){
  const prop = node.data;
  if (prop.uses){
    prop.usesLeft = prop.uses.value - (prop.usesUsed || 0);
  }
  computeResources(computation, node);
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

function computeResources(computation, node){
  const resources = node.data?.resources;
  if (!resources) return;
  resources.attributesConsumed.forEach(attConsumed => {
    if (!attConsumed.variableName) return;
    const att = computation.scope[attConsumed.variableName];
    attConsumed.available = att.value;
    attConsumed.statId = att._id;
    attConsumed.statName = att.name;
  });
}
