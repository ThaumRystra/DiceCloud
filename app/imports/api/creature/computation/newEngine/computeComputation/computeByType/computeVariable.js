import aggregate from './computeVariable/aggregate/index.js';
import computeVariableAsAttribute from './computeVariable/computeVariableAsAttribute.js';
import computeVariableAsSkill from './computeVariable/computeVariableAsSkill.js';
import computeVariableAsConstant from './computeVariable/computeVariableAsConstant.js';
import computeVariableAsClass from './computeVariable/computeVariableAsClass.js';
import computeImplicitVariable from './computeVariable/computeImplicitVariable.js';

export default function computeVariable(graph, node, scope){
  if (!node.data) node.data = {};
  aggregateLinks(graph, node);
  combineAggregations(node, scope);
  if (node.definingProp){
    // Add the defining variable to the scope
    scope[node.id] = node.definingProp
  } else {
    // Otherwise add an implicit variable to the scope
    scope[node.id] = computeImplicitVariable(node, scope);
  }
  console.log('computed variable ', node);
}

function aggregateLinks(graph, node){
  graph.forEachLinkedNode(
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

function combineAggregations(node, scope){
  combineMultiplierAggregator(node);
  node.data.overridenProps?.forEach(prop => {
    computeVariableProp(node, prop, scope);
  });
  computeVariableProp(node, node.data.definingProp, scope);
}

function computeVariableProp(node, prop, scope){
  if (!prop) return;
  if (prop.type === 'attribute'){
    computeVariableAsAttribute(node, prop, scope)
  } else if (prop.type === 'skill'){
    computeVariableAsSkill(node, prop, scope)
  } else if (prop.type === 'constant'){
    computeVariableAsConstant(node, prop, scope)
  } else if (prop.type === 'characterClass'){
    computeVariableAsClass(node, prop, scope)
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
    aggregator.ressistanceCount &&
    !aggregator.vulnerabilityCount
  ){
    value = 0.5;
  }  else if (
    !aggregator.ressistanceCount &&
    aggregator.vulnerabilityCount
  ){
    value = 2;
  } else {
    value = 1;
  }

  node.data.damageMultiplyValue = value;
}
