import evaluateCalculation from '../../utility/evaluateCalculation.js';

export default function computeCalculation(computation, node){
  const calcObj = node.data;
  evaluateCalculation(calcObj, computation.scope);
  aggregateCalculationEffects(node, computation);
}

export function aggregateCalculationEffects(node, computation){
  const calcObj = node.data;
  delete calcObj.effects;
  computation.dependencyGraph.forEachLinkedNode(
    node.id,
    (linkedNode, link) => {
      // Only effect links
      if (link.data !== 'effect') return;
      // That have effect data
      if (!linkedNode.data) return;
      // Ignore inactive props
      if (linkedNode.data.inactive) return;

      // Collate effects
      calcObj.effects = calcObj.effects || [];
      calcObj.effects.push({
        _id: linkedNode.data._id,
        name: linkedNode.data.name,
        operation: linkedNode.data.operation,
        amount: linkedNode.data.amount && {
          value: linkedNode.data.amount.value,
          //parseNode: linkedNode.data.amount.parseNode,
        },
        // ancestors: linkedNode.data.ancestors,
      });
    },
    true // enumerate only outbound links
  );
  if (calcObj.effects && typeof calcObj.value === 'number'){
    calcObj.baseValue = calcObj.value;
    calcObj.effects.forEach(effect => {
      if (
        effect.operation === 'add' &&
        effect.amount && typeof effect.amount.value === 'number'
      ){
        calcObj.value += effect.amount.value
      }
    });
  }
}
