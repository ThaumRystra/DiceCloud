export default function aggregateEffect({ node, linkedNode, link }) {
  if (link.data !== 'effect') return;
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
  let result = linkedNode.data.amount?.value;
  if (typeof result !== 'number') result = undefined;

  // Aggregate the effect based on its operation
  switch (linkedNode.data.operation) {
    case 'base':
      // Take the largest base value
      if (Number.isFinite(result)) {
        if (Number.isFinite(aggregator.base)) {
          aggregator.base = Math.max(aggregator.base, result);
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
      aggregator.min = result > aggregator.min ? result : aggregator.min;
      break;
    case 'max':
      // Take the smallest max value
      aggregator.max = result < aggregator.max ? result : aggregator.max;
      break;
    case 'set':
      // Take the highest set value
      aggregator.set = aggregator.set === undefined || (result > aggregator.set) ?
        result :
        aggregator.set;
      break;
    case 'advantage':
      // Sum advantage amounts, a blank amount counts as 1
      aggregator.advantage += (typeof result === 'number' ? result : 1);
      break;
    case 'disadvantage':
      // Sum disadvantage amounts, a blank amount counts as 1
      aggregator.disadvantage += (typeof result === 'number' ? result : 1);
      break;
    case 'passiveAdd':
      // Add all passive adds together
      aggregator.passiveAdd = (aggregator.passiveAdd || 0) + result;
      break;
    case 'fail':
      // Sum number of fails
      aggregator.fail++;
      break;
    case 'conditional':
      // Store array of conditionals
      aggregator.conditional.push(linkedNode.data.text);
      break;
  }
}
