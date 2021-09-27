import aggregate from './computeVariable/aggregate/index.js';
import computeVariableAsAttribute from './computeVariable/computeVariableAsAttribute.js';
import computeVariableAsSkill from './computeVariable/computeVariableAsSkill.js';
import computeVariableAsConstant from './computeVariable/computeVariableAsConstant.js';
import computeVariableAsClass from './computeVariable/computeVariableAsClass.js';
import computeImplicitVariable from './computeVariable/computeImplicitVariable.js';

export default function computeVariable(computation, node){
  const scope = computation.scope;
  if (!node.data) node.data = {};
  aggregateLinks(computation, node);
  combineAggregations(computation, node);
  if (node.data.definingProp){
    // Add the defining variable to the scope
    scope[node.id] = node.data.definingProp
  } else {
    // Otherwise add an implicit variable to the scope
    scope[node.id] = computeImplicitVariable(node);
  }
}

function aggregateLinks(computation, node){
  computation.dependencyGraph.forEachLinkedNode(
    node.id,
    (linkedNode, link) => {
      if (!linkedNode.data) linkedNode.data = {};
      // Ignore inactive props
      if (linkedNode.data.inactive) return;
      // Apply all the aggregations
      let arg = {node, linkedNode, link};
      aggregate.classLevel(arg);
      aggregate.damageMultiplier(arg);
      aggregate.definition(arg);
      aggregate.effect(arg);
      aggregate.inventory(arg);
      aggregate.proficiency(arg);
    },
    true // enumerate only outbound links
  );
}

function combineAggregations(computation, node){
  combineMultiplierAggregator(node);
  node.data.overridenProps?.forEach(prop => {
    computeVariableProp(computation, node, prop);
  });
  computeVariableProp(computation, node, node.data.definingProp);
}

function computeVariableProp(computation, node, prop){
  if (!prop) return;
  if (prop.type === 'attribute'){
    computeVariableAsAttribute(computation, node, prop)
  } else if (prop.type === 'skill'){
    computeVariableAsSkill(computation, node, prop)
  } else if (prop.type === 'constant'){
    computeVariableAsConstant(computation, node, prop)
  } else if (prop.type === 'class'){
    computeVariableAsClass(computation, node, prop)
  }
}

function combineMultiplierAggregator(node){
  // get a reference to the  aggregator
  const aggregator = node.data.multiplierAggregator;
  if (!aggregator) return;

  // Combine
  let value;
  if (aggregator.immunityCount){
    value = 0;
  } else if (
    aggregator.resistanceCount &&
    !aggregator.vulnerabilityCount
  ){
    value = 0.5;
  }  else if (
    !aggregator.resistanceCount &&
    aggregator.vulnerabilityCount
  ){
    value = 2;
  } else {
    value = 1;
  }
  node.data.damageMultiplyValue = value;
}
