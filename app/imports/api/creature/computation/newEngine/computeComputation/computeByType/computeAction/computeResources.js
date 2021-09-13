export default function computeResources(graph, node, scope){
  const prop = node.data;
  prop.resources.attributesConsumed.forEach(attConsumed => {
    if (!attConsumed.variableName) return;
    const att = scope[attConsumed.variableName];
    attConsumed.available = att.value;
    attConsumed.statId = att._id;
    attConsumed.statName = att.name;
  });
}
