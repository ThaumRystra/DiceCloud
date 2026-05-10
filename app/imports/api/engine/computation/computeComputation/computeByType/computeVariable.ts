import aggregate from './computeVariable/aggregate/index';
import computeVariableAsAttribute from './computeVariable/computeVariableAsAttribute';
import computeVariableAsSkill from './computeVariable/computeVariableAsSkill';
import computeVariableAsConstant from './computeVariable/computeVariableAsConstant';
import computeVariableAsClass from './computeVariable/computeVariableAsClass';
import computeVariableAsToggle from './computeVariable/computeVariableAsToggle';
import computeImplicitVariable from './computeVariable/computeImplicitVariable';
import VARIABLE_NAME_REGEX from '/imports/constants/VARIABLE_NAME_REGEX';
import type CreatureComputation from '/imports/api/engine/computation/CreatureComputation';
import type { TraversedNode } from '/imports/api/engine/computation/computeCreatureComputation';
import type { DependencyGraphNode } from '/imports/api/engine/computation/CreatureComputation';

export default function computeVariable(computation: CreatureComputation, node: TraversedNode) {
  const scope = computation.scope;
  // Don't add to the scope if the node id is not a legitimate variable name
  // Without this `some.thing` could break the entire sheet as a database key
  if (typeof node.id === 'number' || !VARIABLE_NAME_REGEX.test(node.id)) return;
  aggregateLinks(computation, node);
  combineAggregations(computation, node);
  if (node.data.definingProp) {
    // Add the defining variable to the scope
    scope[node.id] = node.data.definingProp
  } else {
    // Otherwise add an implicit variable to the scope
    scope[node.id] = computeImplicitVariable(node);
  }
}

function aggregateLinks(computation: CreatureComputation, node: TraversedNode) {
  computation.dependencyGraph.forEachLinkedNode(
    node.id,
    (linkedNode, link) => {
      // Ignore inactive props
      if ('inactive' in linkedNode.data && linkedNode.data.inactive) return;
      // Ignore point buy rows if their base table is inactive
      if (
        'tableId' in linkedNode.data
        && linkedNode.data.tableId
        && computation.propsById[linkedNode.data.tableId]?.inactive
      ) return;
      // Apply all the aggregations
      const arg = { node, linkedNode, link, computation };
      aggregate.classLevel(arg);
      aggregate.damageMultiplier(arg);
      aggregate.definition(arg);
      aggregate.effect(arg);
      aggregate.eventDefinition(arg);
      aggregate.inventory(arg);
      aggregate.proficiency(arg);
    },
    true // enumerate only outbound links
  );
}

function combineAggregations(computation: CreatureComputation, node: TraversedNode) {
  combineMultiplierAggregator(node);
  computeVariableProp(computation, node, node.data.definingProp);
}

function computeVariableProp(computation: CreatureComputation, node: TraversedNode, prop: DependencyGraphNode | undefined) {
  if (!prop) return;

  // Combine damage multipliers in all props so that they can't be overridden
  if (node.data.immunity) {
    prop.immunity = node.data.immunity;
    prop.immunities = node.data.immunities;
  }
  if (node.data.resistance) {
    prop.resistance = node.data.resistance;
    prop.resistances = node.data.resistances;
  }
  if (node.data.vulnerability) {
    prop.vulnerability = node.data.vulnerability;
    prop.vulnerabilities = node.data.vulnerabilities;
  }

  if (prop.type === 'attribute') {
    computeVariableAsAttribute(computation, node, prop);
  } else if (prop.type === 'skill') {
    computeVariableAsSkill(computation, node, prop);
  } else if (prop.type === 'constant') {
    computeVariableAsConstant(computation, node, prop);
  } else if (prop.type === 'class') {
    computeVariableAsClass(computation, node, prop);
  } else if (prop.type === 'toggle') {
    computeVariableAsToggle(computation, node, prop);
  }
}

function combineMultiplierAggregator(node) {
  // get a reference to the  aggregator
  const aggregator = node.data.multiplierAggregator;
  if (!aggregator) return;

  // Combine
  if (aggregator.immunities?.length) {
    node.data.immunity = true;
    node.data.immunities = aggregator.immunities;
  }
  if (aggregator.resistances?.length) {
    node.data.resistance = true;
    node.data.resistances = aggregator.resistances;
  }
  if (aggregator.vulnerabilities?.length) {
    node.data.vulnerability = true;
    node.data.vulnerabilities = aggregator.vulnerabilities;
  }
}
