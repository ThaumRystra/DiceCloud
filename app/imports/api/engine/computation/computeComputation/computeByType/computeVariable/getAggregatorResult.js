import stripFloatingPointOddities from '/imports/api/engine/computation/utility/stripFloatingPointOddities';

export default function getAggregatorResult(node) {
  // Work out the base value as the greater of the deining stat value
  // This baseValue comes from aggregating definitions
  let statBase = node.data.baseValue;

  // get a reference to the  aggregator
  const aggregator = node.data.effectAggregator;

  // Without effects just return the defining base value
  if (!aggregator) return statBase;

  let base;
  if (!Number.isFinite(aggregator.base)) {
    base = statBase || 0;
  } else if (!Number.isFinite(statBase)) {
    base = aggregator.base || 0;
  } else {
    base = Math.max(aggregator.base, statBase);
  }
  let result = (base + aggregator.add) * aggregator.mul;
  if (result < aggregator.min) {
    result = aggregator.min;
  }
  if (result > aggregator.max) {
    result = aggregator.max;
  }
  if (aggregator.set !== undefined) {
    result = aggregator.set;
  }
  if (!node.data.definingProp?.decimal && Number.isFinite(result)) {
    result = Math.floor(result);
  } else if (Number.isFinite(result)) {
    result = stripFloatingPointOddities(result);
  }

  return result;
}
