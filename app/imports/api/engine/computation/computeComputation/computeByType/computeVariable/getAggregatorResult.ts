import type { TraversedNode } from '/imports/api/engine/computation/computeCreatureComputation';
import stripFloatingPointOddities from '/imports/api/engine/computation/utility/stripFloatingPointOddities';

export default function getAggregatorResult(node: TraversedNode) {
  // Work out the base value as the greater of the deining stat value
  // This baseValue comes from aggregating definitions
  const nodeBase = 'baseValue' in node.data ? node.data.baseValue : undefined;
  const statBaseValue = nodeBase !== undefined && (typeof nodeBase === 'number' ? nodeBase : nodeBase.value);
  const statBase = typeof statBaseValue === 'number' ? statBaseValue : undefined;

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
    base = Math.max(aggregator.base ?? 0, statBase ?? 0);
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
  if (
    node.data.definingProp
    && 'decimal' in node.data.definingProp
    && !node.data.definingProp?.decimal
    && Number.isFinite(result)
  ) {
    result = Math.floor(result);
  } else if (Number.isFinite(result)) {
    result = stripFloatingPointOddities(result);
  }

  return result;
}
