import type { Link } from 'ngraph.graph';
import type { TraversedNode } from '/imports/api/engine/computation/computeCreatureComputation';

export default function aggregateEffect({ node, linkedNode, link }: {
  node: TraversedNode;
  linkedNode: TraversedNode;
  link: Link<string>;
}) {
  if (link.data !== 'effect') return;
  if (linkedNode.data.type !== 'effect') return;
  // store the effect aggregator, its presence indicates that the variable is
  // targeted by effects
  if (!node.data.effectAggregator) node.data.effectAggregator = {
    base: undefined,
    add: 0,
    mul: 1,
    min: Number.NEGATIVE_INFINITY,
    max: Number.POSITIVE_INFINITY,
    advantage: 0,
    disadvantage: 0,
    passiveAdd: undefined,
    fail: 0,
    set: undefined,
    conditional: [],
    rollBonus: [],
  };

  // Store a link to the effect
  node.data.effectIds = node.data.effectIds || [];
  node.data.effectIds.push(linkedNode.data._id);

  // get a shorter reference to the aggregator document
  const aggregator = node.data.effectAggregator;
  // Get the result of the effect
  let result = 'amount' in linkedNode.data && linkedNode.data.amount?.value;
  if (typeof result !== 'number') result = undefined;

  // Aggregate the effect based on its operation
  switch (linkedNode.data.operation) {
    case 'base':
      // Take the largest base value
      if (Number.isFinite(result)) {
        if (aggregator.base !== undefined && Number.isFinite(aggregator.base)) {
          aggregator.base = result !== undefined ? Math.max(aggregator.base, result) : aggregator.base;
        } else {
          aggregator.base = result;
        }
      }
      break;
    case 'add':
      // Add all adds together
      aggregator.add += result || 0;
      break;
    case 'mul':
      // Multiply the muls together
      aggregator.mul *= result || 1;
      break;
    case 'min':
      // Take the largest min value
      aggregator.min = result !== undefined && result > aggregator.min ? result : aggregator.min;
      break;
    case 'max':
      // Take the smallest max value
      aggregator.max = result !== undefined && result < aggregator.max ? result : aggregator.max;
      break;
    case 'set':
      // Take the highest set value
      aggregator.set = aggregator.set === undefined || (result !== undefined && result > aggregator.set) ?
        result :
        aggregator.set;
      break;
    case 'advantage':
      // Sum number of advantages
      aggregator.advantage++;
      break;
    case 'disadvantage':
      // Sum number of disadvantages
      aggregator.disadvantage++;
      break;
    case 'passiveAdd':
      // Add all passive adds together
      aggregator.passiveAdd = (aggregator.passiveAdd || 0) + (result ?? 0);
      break;
    case 'fail':
      // Sum number of fails
      aggregator.fail++;
      break;
    case 'conditional':
      // Store array of conditionals
      if (linkedNode.data.text) aggregator.conditional.push(linkedNode.data.text);
      break;
  }
}
