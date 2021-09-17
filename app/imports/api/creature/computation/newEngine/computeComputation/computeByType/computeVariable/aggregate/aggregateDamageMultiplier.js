export default function aggregateDamageMultipliers({node, linkedNode, link}){
  if (link.data !== 'damageMultiplier') return;
  const multiplierValue = linkedNode.data.value;
  if (multiplierValue === undefined) return;
  // Store an aggregator, its presence indicates damage multipliers target this
  // variable
  if (!node.data.multiplierAggregator) node.data.multiplierAggregator = {
    immunityCount: 0,
    resistanceCount: 0,
    vulnerabilityCount: 0,
  }
  // Store a short reference to the aggregator
  const aggregator = node.data.multiplierAggregator;
  // Sum the counts of each type of multiplier
  if (multiplierValue === 0){
    aggregator.immunityCount += 1;
  } else if (multiplierValue === 0.5){
    aggregator.resistanceCount += 1;
  } else if (multiplierValue === 2){
    aggregator.vulnerabilityCount += 1;
  }
}
