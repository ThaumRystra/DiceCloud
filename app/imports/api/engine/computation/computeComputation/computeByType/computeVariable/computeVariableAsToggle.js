import getAggregatorResult from './getAggregatorResult';

export default function computeVariableAsToggle(computation, node, prop) {
  const result = getAggregatorResult(node) || 0;

  prop.value = !!result || !!prop.enabled || !!prop.condition?.value;
}
