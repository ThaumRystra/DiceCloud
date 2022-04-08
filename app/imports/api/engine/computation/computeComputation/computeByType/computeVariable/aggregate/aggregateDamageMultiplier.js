import { pick } from 'lodash';

export default function aggregateDamageMultipliers({node, linkedNode, link}){
  if (link.data !== 'damageMultiplier') return;
  const multiplierValue = linkedNode.data.value;
  if (multiplierValue === undefined) return;

  // Store an aggregator, its presence indicates damage multipliers target this
  // variable
  if (!node.data.multiplierAggregator) node.data.multiplierAggregator = {
    immunities: [],
    resistances: [],
    vulnerabilities: [],
  }
  // Store a short reference to the aggregator
  const aggregator = node.data.multiplierAggregator;

  // Make a stripped down copy of the multiplier to store in the aggregator
  const keysToStore = ['_id', 'name'];
  if (linkedNode.data.excludeTags?.length){
    keysToStore.push('excludeTags');
  }
  if (linkedNode.data.includeTags?.length){
    keysToStore.push('includeTags');
  }
  const storedMultiplier = pick(linkedNode.data, keysToStore);

  // Store the multiplier in the appropriate field
  if (multiplierValue === 0){
    aggregator.immunities.push(storedMultiplier);
  } else if (multiplierValue === 0.5){
    aggregator.resistances.push(storedMultiplier);
  } else if (multiplierValue === 2){
    aggregator.vulnerabilities.push(storedMultiplier);
  }
}
